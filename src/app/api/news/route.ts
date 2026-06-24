import { NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    image: string | null;
}

// Parse Google News RSS XML into articles
function parseRSS(xml: string, limit: number): NewsArticle[] {
    const articles: NewsArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && articles.length < limit) {
        const item = match[1];
        const title = extractTag(item, 'title');
        const link = extractTag(item, 'link');
        const description = extractTag(item, 'description');
        const pubDate = extractTag(item, 'pubDate');
        const source = extractTag(item, 'source');

        if (!title || !link) continue;

        // Extract image from description if present
        const imgMatch = description?.match(/<img[^>]+src="([^"]+)"/);
        const image = imgMatch ? imgMatch[1] : null;

        // Clean description (strip HTML)
        const cleanDesc = description
            ? description.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').slice(0, 300)
            : '';

        articles.push({
            title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
            description: cleanDesc,
            url: link,
            source: source || 'Google News',
            publishedAt: pubDate || new Date().toISOString(),
            image,
        });
    }
    return articles;
}

function extractTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i'));
    return match ? match[1].trim() : '';
}

// Fetch from GNews API (upgrade path)
async function fetchGNews(query: string, limit: number): Promise<NewsArticle[]> {
    if (!GNEWS_API_KEY) return [];
    try {
        const res = await fetch(
            `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&country=ke&max=${limit}&token=${GNEWS_API_KEY}`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.articles || []).map((a: { title?: string; description?: string; url?: string; source?: { name?: string } | string; publishedAt?: string; image?: string }) => ({
            title: String(a.title || ''),
            description: String(a.description || '').slice(0, 300),
            url: String(a.url || ''),
            source: typeof a.source === 'object' ? String((a.source as { name?: string }).name || 'GNews') : String(a.source || 'GNews'),
            publishedAt: String(a.publishedAt || new Date().toISOString()),
            image: a.image || null,
        }));
    } catch {
        return [];
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const topic = searchParams.get('topic') || 'jobs';
        const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 30);

        const topicMap: Record<string, string> = {
            jobs: 'jobs+kenya+hiring',
            business: 'kenya+business+economy',
            careers: 'kenya+careers+professional',
            tech: 'kenya+technology+startups',
        };
        const query = topicMap[topic] || topicMap.jobs;

        let articles: NewsArticle[] = [];

        // Try GNews first if key is available
        if (GNEWS_API_KEY) {
            articles = await fetchGNews(query, limit);
        }

        // Fallback to Google News RSS (always works, no key needed)
        if (articles.length === 0) {
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-KE&gl=KE&ceid=KE:en`;
            const res = await fetch(rssUrl, { next: { revalidate: 900 } });
            if (res.ok) {
                const xml = await res.text();
                articles = parseRSS(xml, limit);
            }
        }

        // Deduplicate by URL
        const seen = new Set<string>();
        const unique = articles.filter(a => {
            if (seen.has(a.url)) return false;
            seen.add(a.url);
            return true;
        });

        return NextResponse.json({
            success: true,
            totalCount: unique.length,
            articles: unique,
            source: GNEWS_API_KEY ? 'gnews' : 'google-rss',
        });
    } catch (error) {
        console.error('News API error:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

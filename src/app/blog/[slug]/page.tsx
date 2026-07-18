import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { getBaseUrl } from '@/lib/utils/url';
import { htmlToText } from '@/lib/utils/jobs';
import { notFound } from 'next/navigation';
import { hasSubstantiveArticleContent } from '@/lib/content-quality';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('status', 'published')
        .single();

    if (!post) {
        return {
            title: 'Article Not Found',
            robots: { index: false, follow: false },
        };
    }

    const siteUrl = getBaseUrl();
    const url = `${siteUrl}/blog/${resolvedParams.slug}`;
    const dynamicOgImageUrl = `${siteUrl}/api/og/blog/${resolvedParams.slug}`;
    const description = htmlToText(post.excerpt || post.content).trim().substring(0, 160)
        || `Read ${post.title} from the Job Openings Kenya editorial team.`;
    
    return {
        title: post.title,
        description,
        alternates: { canonical: url },
        robots: hasSubstantiveArticleContent(post.content)
            ? { index: true, follow: true }
            : { index: false, follow: true },
        openGraph: {
            title: post.title,
            description,
            url: url,
            siteName: 'Job Openings Kenya',
            images: [
                {
                    url: dynamicOgImageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
            images: [dynamicOgImageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('status', 'published')
        .single();

    if (!post) notFound();

    const { data: { user } } = await supabase.auth.getUser();

    // Increment views (best-effort — won't break if function doesn't exist)
    if (post?.id) {
        try { await supabase.rpc('increment_blog_views', { row_id: post.id }); } catch {}
    }

    return <BlogPostClient post={post} user={user} slug={resolvedParams.slug} />;
}

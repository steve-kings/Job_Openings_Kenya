import { NextResponse } from 'next/server';

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
const CAREERJET_AFFID = process.env.CAREERJET_AFFID;

interface ExternalJob {
    id: string;
    title: string;
    company: string;
    location: string;
    snippet: string;
    salary: string | null;
    type: string;
    link: string;
    source: string;
    updated: string;
}

export async function POST(request: Request) {
    const { keywords = 'jobs', location = 'Nairobi, Kenya' } = await request.json();
    let allJobs: ExternalJob[] = [];

    // ── Source 1: Jooble ──
    if (JOOBLE_API_KEY) {
        try {
            const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords, location, ResultOnPage: '5', companysearch: 'false' }),
            });
            if (res.ok) {
                const data = await res.json();
                const jobs = (data.jobs || []).map((j: Record<string, unknown>) => ({
                    id: `jooble-${j.id}`,
                    title: String(j.title || ''),
                    company: String(j.company || ''),
                    location: String(j.location || location),
                    snippet: String(j.snippet || ''),
                    salary: j.salary ? String(j.salary) : null,
                    type: String(j.type || 'Job'),
                    link: String(j.link || ''),
                    source: 'Jooble',
                    updated: String(j.updated || new Date().toISOString()),
                }));
                allJobs = [...allJobs, ...jobs];
            }
        } catch { /* Jooble unavailable, continue */ }
    }

    // ── Source 2: CareerJet ──
    if (CAREERJET_AFFID) {
        try {
            const localeMap: Record<string, string> = {
                'nairobi': 'en_KE',
                'mombasa': 'en_KE',
                'kisumu': 'en_KE',
                'kenya': 'en_KE',
            };
            const localeKey = Object.keys(localeMap).find(k => location.toLowerCase().includes(k));
            const locale = localeKey ? localeMap[localeKey] : 'en_KE';

            const params = new URLSearchParams({
                locale_code: locale,
                keywords,
                location,
                pagesize: '5',
                affid: CAREERJET_AFFID,
                format: 'json',
                user_ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
                user_agent: request.headers.get('user-agent') || 'Mozilla/5.0',
            });

            const res = await fetch(`http://public.api.careerjet.net/search?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.type === 'JOBS' && data.jobs) {
                    const jobs = data.jobs.map((j: Record<string, unknown>, i: number) => ({
                        id: `cj-${i}`,
                        title: String(j.title || ''),
                        company: String(j.company || ''),
                        location: String(j.locations || location),
                        snippet: String(j.description || ''),
                        salary: j.salary ? String(j.salary) : null,
                        type: 'Job',
                        link: String(j.url || ''),
                        source: 'CareerJet',
                        updated: String(j.date || new Date().toISOString()),
                    }));
                    allJobs = [...allJobs, ...jobs];
                }
            }
        } catch { /* CareerJet unavailable, continue */ }
    }

    // Deduplicate by title+company
    const seen = new Set<string>();
    const unique = allJobs.filter(j => {
        const key = `${j.title}|${j.company}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 6);

    return NextResponse.json({ success: true, totalCount: unique.length, jobs: unique });
}

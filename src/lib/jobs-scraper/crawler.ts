import { extractCandidateLinks, extractJobPostings } from './extract-jsonld';
import { readLimitedText, safeFetch } from './network';
import { robotsAllows } from './robots';
import type { ScrapedJob, ScraperSource } from './types';

export async function crawlJsonLdSource(source: ScraperSource): Promise<{ jobs: ScrapedJob[]; pagesVisited: number; errors: string[] }> {
    const queue = [...(source.startUrls || [])];
    const queued = new Set(queue);
    const visited = new Set<string>();
    const jobs: ScrapedJob[] = [];
    const errors: string[] = [];
    const allowedHosts = new Set(queue.map(url => new URL(url).hostname));
    const maxPages = source.maxPages || 20;

    while (queue.length && visited.size < maxPages) {
        const url = queue.shift()!;
        if (visited.has(url)) continue;
        visited.add(url);

        try {
            const parsed = new URL(url);
            if (!allowedHosts.has(parsed.hostname)) continue;
            const robots = await robotsAllows(parsed);
            if (!robots.allows(`${parsed.pathname}${parsed.search}`)) {
                errors.push(`Blocked by robots.txt: ${parsed.pathname}`);
                continue;
            }

            const response = await safeFetch(url);
            if (!response.ok) {
                errors.push(`${parsed.pathname}: HTTP ${response.status}`);
                continue;
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) continue;
            const html = await readLimitedText(response);
            jobs.push(...extractJobPostings(html, url, source.name));

            for (const link of extractCandidateLinks(html, url)) {
                if (!queued.has(link) && !visited.has(link) && queue.length + visited.size < maxPages * 4) {
                    queued.add(link);
                    queue.push(link);
                }
            }
        } catch (error) {
            errors.push(`${new URL(url).pathname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        if (queue.length) await delay(source.requestDelayMs || 750);
    }

    return { jobs: deduplicate(jobs), pagesVisited: visited.size, errors: errors.slice(0, 20) };
}
function deduplicate(jobs: ScrapedJob[]): ScrapedJob[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
        const key = `${job.source}:${job.sourceJobId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

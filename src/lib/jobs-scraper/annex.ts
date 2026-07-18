import { readLimitedText, safeFetch } from './network';
import type { ScrapedJob, ScraperSource } from './types';

const ANNEX_API = 'https://api.careers.annex-technologies.com/api/jobs';

interface AnnexPage {
    jobs?: Array<Record<string, unknown>>;
    pages?: number;
}
export async function crawlAnnex(source: ScraperSource): Promise<{ jobs: ScrapedJob[]; pagesVisited: number }> {
    const jobs: ScrapedJob[] = [];
    const limit = Math.min(source.maxPages || 5, 10);
    let pagesVisited = 0;

    for (let page = 1; page <= limit; page += 1) {
        const url = new URL(ANNEX_API);
        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', '100');
        url.searchParams.set('sort_by', 'posted_date');
        url.searchParams.set('sort_order', 'desc');

        const response = await safeFetch(url.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Annex returned HTTP ${response.status}`);
        const data = JSON.parse(await readLimitedText(response)) as AnnexPage;
        pagesVisited += 1;

        for (const item of data.jobs || []) {
            const job = normalizeAnnexJob(item, source.name);
            if (job) jobs.push(job);
        }
        if (!data.jobs?.length || page >= (data.pages || 1)) break;
    }

    return { jobs, pagesVisited };
}

function normalizeAnnexJob(value: Record<string, unknown>, source: string): ScrapedJob | null {
    const id = stringValue(value.id);
    const title = stringValue(value.title);
    const applyUrl = validUrl(stringValue(value.apply_url) || stringValue(value.url));
    if (!id || !title || !applyUrl) return null;

    const description = cleanText(stringValue(value.description));
    const requirements = stringValue(value.requirements)
        .split(/\r?\n/)
        .map(item => cleanText(item))
        .filter(Boolean)
        .slice(0, 50);

    return {
        source,
        sourceJobId: id,
        sourceUrl: validUrl(stringValue(value.url)) || applyUrl,
        title,
        company: stringValue(value.company) || 'Undisclosed employer',
        location: stringValue(value.location) || null,
        description: description || null,
        shortDescription: description.slice(0, 260) || null,
        requirements,
        responsibilities: [],
        deadline: dateOnly(value.application_deadline),
        applyUrl,
        salaryMin: numberValue(value.salary_min),
        salaryMax: numberValue(value.salary_max),
        salaryCurrency: stringValue(value.salary_currency) || null,
        thumbnailUrl: null,
        postedAt: isoDate(value.posted_date),
        remote: value.remote === true,
    };
}

function stringValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function cleanText(value: string): string {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function numberValue(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function isoDate(value: unknown): string | null {
    const raw = stringValue(value);
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateOnly(value: unknown): string | null {
    return isoDate(value)?.slice(0, 10) || null;
}

function validUrl(value: string): string | null {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
        return null;
    }
}

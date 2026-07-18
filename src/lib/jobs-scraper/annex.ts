import { readLimitedText, safeFetch } from './network';
import type { ScrapedJob, ScraperSource } from './types';

const ANNEX_API = 'https://api.careers.annex-technologies.com/api/jobs';

interface AnnexPage {
    jobs?: Array<Record<string, unknown>>;
    pages?: number;
}
export async function crawlAnnex(source: ScraperSource): Promise<{ jobs: ScrapedJob[]; pagesVisited: number }> {
    const jobs = new Map<string, ScrapedJob>();
    const limit = Math.min(source.maxPages || 5, 10);
    let pagesVisited = 0;

    for (let page = 1; page <= limit; page += 1) {
        const url = buildAnnexPageUrl(source, page);

        const response = await safeFetch(url.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Annex returned HTTP ${response.status}`);
        const data = JSON.parse(await readLimitedText(response)) as AnnexPage;
        pagesVisited += 1;

        for (const item of data.jobs || []) {
            const job = normalizeAnnexJob(item, source);
            if (job) jobs.set(job.sourceJobId, job);
        }
        if (!data.jobs?.length || page >= (data.pages || 1)) break;
    }

    return { jobs: [...jobs.values()], pagesVisited };
}

export function buildAnnexPageUrl(source: ScraperSource, page: number): URL {
    const url = new URL(ANNEX_API);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '100');
    url.searchParams.set('location', source.location?.trim() || 'Kenya');
    url.searchParams.set('sort_by', 'posted_date');
    url.searchParams.set('sort_order', 'desc');
    return url;
}

export function normalizeAnnexJob(
    value: Record<string, unknown>,
    source: ScraperSource,
    now: Date = new Date(),
): ScrapedJob | null {
    const id = stringValue(value.id);
    const title = stringValue(value.title);
    const company = stringValue(value.company);
    const location = stringValue(value.location);
    const applyUrl = validUrl(stringValue(value.apply_url) || stringValue(value.url));
    const description = cleanText(stringValue(value.description));
    const deadline = dateOnly(value.application_deadline);
    const postedAt = isoDate(value.posted_date);

    if (
        !id
        || !isSubstantiveTitle(title)
        || !company
        || company.length > 160
        || !locationMatches(location, source.location || 'Kenya')
        || location.length > 200
        || !applyUrl
        || value.is_active !== true
        || description.length < (source.minimumDescriptionLength || 160)
        || !isCurrentListing(postedAt, deadline, source.maxAgeDays || 90, now)
    ) return null;

    const requirements = stringValue(value.requirements)
        .split(/\r?\n/)
        .map(item => cleanText(item))
        .filter(Boolean)
        .slice(0, 50);

    return {
        source: source.name,
        sourceJobId: id,
        sourceUrl: validUrl(stringValue(value.url)) || applyUrl,
        title,
        company,
        location,
        description,
        shortDescription: description.slice(0, 260),
        requirements,
        responsibilities: [],
        deadline,
        applyUrl,
        salaryMin: numberValue(value.salary_min),
        salaryMax: numberValue(value.salary_max),
        salaryCurrency: stringValue(value.salary_currency) || null,
        thumbnailUrl: null,
        postedAt,
        remote: value.remote === true,
    };
}

function locationMatches(location: string, expected: string): boolean {
    if (!location) return false;
    const normalizedExpected = expected.trim().toLocaleLowerCase('en');
    if (normalizedExpected === 'kenya') return /\bkenya\b/i.test(location);
    return location.toLocaleLowerCase('en').includes(normalizedExpected);
}

function isSubstantiveTitle(title: string): boolean {
    if (title.length < 3 || title.length > 180) return false;
    return !/^(?:career|employment|job|vacanc(?:y|ies)|career opportunities|job opportunities|multiple positions|various positions|labor jobs)$/i.test(title);
}

function isCurrentListing(postedAt: string | null, deadline: string | null, maxAgeDays: number, now: Date): boolean {
    const today = now.toISOString().slice(0, 10);
    if (deadline && deadline < today) return false;

    const postedTime = postedAt ? new Date(postedAt).getTime() : Number.NaN;
    const latestAllowed = now.getTime() + 24 * 60 * 60 * 1000;
    if (Number.isFinite(postedTime) && postedTime > latestAllowed) return false;

    const hasCurrentDeadline = !!deadline && deadline >= today;
    const earliestAllowed = now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000;
    return hasCurrentDeadline || (Number.isFinite(postedTime) && postedTime >= earliestAllowed);
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

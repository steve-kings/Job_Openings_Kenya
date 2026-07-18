import { createHash } from 'node:crypto';
import type { ScrapedJob } from './types';

type JsonObject = Record<string, unknown>;

export function extractJobPostings(html: string, pageUrl: string, source: string): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];
    const scriptPattern = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

    for (const match of html.matchAll(scriptPattern)) {
        const raw = match[1].trim();
        if (!raw) continue;
        try {
            const parsed = JSON.parse(raw) as unknown;
            for (const node of flattenJsonLd(parsed)) {
                if (hasType(node, 'JobPosting')) {
                    const normalized = normalizeJobPosting(node, pageUrl, source);
                    if (normalized) jobs.push(normalized);
                }
            }
        } catch {
            // A malformed JSON-LD block should not stop other jobs on the page.
        }
    }

    return jobs;
}

export function extractCandidateLinks(html: string, pageUrl: string): string[] {
    const current = new URL(pageUrl);
    const results = new Set<string>();
    const anchorPattern = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>/gi;
    const jobPath = /\b(job|jobs|career|careers|vacancy|vacancies|position|positions|opening|opportunity|recruit)/i;

    for (const match of html.matchAll(anchorPattern)) {
        try {
            const target = new URL(decodeHtml(match[1]), current);
            target.hash = '';
            if (target.protocol === 'https:' && target.hostname === current.hostname && jobPath.test(`${target.pathname}${target.search}`)) {
                results.add(target.toString());
            }
        } catch {
            // Ignore invalid links.
        }
    }
    return [...results];
}

function flattenJsonLd(value: unknown): JsonObject[] {
    if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
    if (!isObject(value)) return [];
    const graph = Array.isArray(value['@graph']) ? value['@graph'].flatMap(flattenJsonLd) : [];
    return [value, ...graph];
}

function normalizeJobPosting(job: JsonObject, pageUrl: string, source: string): ScrapedJob | null {
    const title = text(job.title);
    const organization = isObject(job.hiringOrganization) ? job.hiringOrganization : {};
    const company = text(organization.name) || 'Undisclosed employer';
    const applyUrl = absoluteHttpUrl(text(job.url) || pageUrl, pageUrl);
    if (!title || !applyUrl) return null;

    const identifier = isObject(job.identifier) ? text(job.identifier.value) : text(job.identifier);
    const sourceJobId = identifier || createHash('sha256').update(`${source}|${applyUrl}`).digest('hex').slice(0, 40);
    const rawDescription = text(job.description);
    const description = cleanText(rawDescription);
    const requirements = splitList(text(job.qualifications) || text(job.experienceRequirements) || text(job.skills));
    const responsibilities = splitList(text(job.responsibilities));
    const salary = salaryFields(job.baseSalary);
    const deadline = dateOnly(text(job.validThrough));
    const logo = isObject(organization.logo) ? text(organization.logo.url) : text(organization.logo);

    return {
        source,
        sourceJobId,
        sourceUrl: pageUrl,
        title,
        company,
        location: jobLocation(job),
        description: description || null,
        shortDescription: description.slice(0, 260) || null,
        requirements,
        responsibilities,
        deadline,
        applyUrl,
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryCurrency: salary.currency,
        thumbnailUrl: absoluteHttpUrl(logo, pageUrl),
        postedAt: isoDate(text(job.datePosted)),
        remote: text(job.jobLocationType).toUpperCase() === 'TELECOMMUTE',
    };
}

function jobLocation(job: JsonObject): string | null {
    const values = Array.isArray(job.jobLocation) ? job.jobLocation : [job.jobLocation];
    const locations = values.flatMap(value => {
        if (!isObject(value)) return [];
        const address = isObject(value.address) ? value.address : value;
        return [[address.addressLocality, address.addressRegion, address.addressCountry].map(text).filter(Boolean).join(', ')];
    }).filter(Boolean);
    if (locations.length) return [...new Set(locations)].join(' / ');
    if (text(job.jobLocationType).toUpperCase() === 'TELECOMMUTE') return 'Remote';
    return null;
}

function salaryFields(value: unknown): { min: number | null; max: number | null; currency: string | null } {
    if (!isObject(value)) return { min: null, max: null, currency: null };
    const nested = isObject(value.value) ? value.value : value;
    const min = numberValue(nested.minValue ?? nested.value);
    const max = numberValue(nested.maxValue ?? nested.value);
    return { min, max, currency: text(value.currency) || null };
}

function splitList(value: string): string[] {
    const cleaned = cleanText(value);
    if (!cleaned) return [];
    return cleaned.split(/\n|\s*[•;]\s*/).map(item => item.trim()).filter(item => item.length >= 3).slice(0, 50);
}

function hasType(value: JsonObject, expected: string): boolean {
    const type = value['@type'];
    return Array.isArray(type) ? type.includes(expected) : type === expected;
}

function cleanText(value: string): string {
    return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function decodeHtml(value: string): string {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number(digits)))
        .replace(/&#x([\da-f]+);/gi, (_, digits) => String.fromCodePoint(parseInt(digits, 16)));
}

function absoluteHttpUrl(value: string, base: string): string | null {
    if (!value) return null;
    try {
        const url = new URL(value, base);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
        return null;
    }
}

function dateOnly(value: string): string | null {
    const iso = isoDate(value);
    return iso ? iso.slice(0, 10) : null;
}

function isoDate(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function text(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
    return '';
}

function numberValue(value: unknown): number | null {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function isObject(value: unknown): value is JsonObject {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

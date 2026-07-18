import type { ScraperSource } from './types';

const MAX_PAGES_PER_SOURCE = 50;

export function getScraperSources(): ScraperSource[] {
    return parseScraperSources(process.env.JOB_SCRAPER_SOURCES_JSON);
}

export function parseScraperSources(raw: string | undefined): ScraperSource[] {
    if (!raw) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('JOB_SCRAPER_SOURCES_JSON must be valid JSON');
    }

    if (!Array.isArray(parsed)) {
        throw new Error('JOB_SCRAPER_SOURCES_JSON must contain an array');
    }

    return parsed.map((item, index) => validateSource(item, index)).filter(source => source.enabled !== false);
}

function validateSource(value: unknown, index: number): ScraperSource {
    if (!value || typeof value !== 'object') {
        throw new Error(`Scraper source ${index + 1} must be an object`);
    }

    const source = value as Partial<ScraperSource>;
    if (!source.name?.trim()) throw new Error(`Scraper source ${index + 1} needs a name`);
    if (source.kind !== 'jsonld' && source.kind !== 'annex') {
        throw new Error(`Scraper source "${source.name}" has an unsupported kind`);
    }

    const startUrls = source.startUrls?.map(url => {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'https:') throw new Error(`Scraper URLs must use HTTPS: ${url}`);
        parsedUrl.hash = '';
        return parsedUrl.toString();
    });

    if (source.kind === 'jsonld' && !startUrls?.length) {
        throw new Error(`JSON-LD source "${source.name}" needs at least one startUrl`);
    }

    const location = optionalTrimmedString(source.location, `Scraper source "${source.name}" location`);

    return {
        name: source.name.trim(),
        kind: source.kind,
        enabled: source.enabled !== false,
        startUrls,
        location: source.kind === 'annex' ? location || 'Kenya' : undefined,
        maxPages: Math.min(Math.max(source.maxPages || 20, 1), MAX_PAGES_PER_SOURCE),
        maxAgeDays: source.kind === 'annex'
            ? boundedInteger(source.maxAgeDays, 90, 1, 365, `Scraper source "${source.name}" maxAgeDays`)
            : undefined,
        minimumDescriptionLength: source.kind === 'annex'
            ? boundedInteger(
                source.minimumDescriptionLength,
                160,
                80,
                5000,
                `Scraper source "${source.name}" minimumDescriptionLength`,
            )
            : undefined,
        requestDelayMs: Math.min(Math.max(source.requestDelayMs || 750, 250), 5000),
        autoPublish: source.autoPublish === true,
    };
}

function optionalTrimmedString(value: unknown, label: string): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value.trim();
}

function boundedInteger(value: unknown, fallback: number, minimum: number, maximum: number, label: string): number {
    if (value === undefined || value === null) return fallback;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${label} must be a number`);
    }
    return Math.min(Math.max(Math.floor(value), minimum), maximum);
}

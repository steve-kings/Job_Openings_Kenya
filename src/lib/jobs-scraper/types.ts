export type ScraperSourceKind = 'jsonld' | 'annex';

export interface ScraperSource {
    name: string;
    kind: ScraperSourceKind;
    enabled?: boolean;
    startUrls?: string[];
    maxPages?: number;
    requestDelayMs?: number;
    autoPublish?: boolean;
}

export interface ScrapedJob {
    source: string;
    sourceJobId: string;
    sourceUrl: string;
    title: string;
    company: string;
    location: string | null;
    description: string | null;
    shortDescription: string | null;
    requirements: string[];
    responsibilities: string[];
    deadline: string | null;
    applyUrl: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    thumbnailUrl: string | null;
    postedAt: string | null;
    remote: boolean;
}

export interface SourceRunResult {
    source: string;
    pagesVisited: number;
    discovered: number;
    insertedOrUpdated: number;
    skipped: number;
    errors: string[];
}

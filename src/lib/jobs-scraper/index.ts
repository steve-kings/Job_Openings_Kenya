import { crawlAnnex } from './annex';
import { getScraperSources } from './config';
import { crawlJsonLdSource } from './crawler';
import {
    deactivateStaleAutoPublishedJobs,
    publishExistingScrapedJobs,
    recordScraperRun,
    refreshSeenScrapedJobs,
    storeScrapedJobs,
} from './store';
import type { SourceRunResult } from './types';

export async function runJobScraper(options: {
    dryRun?: boolean;
    onlySource?: string;
    publishExisting?: boolean;
} = {}) {
    if (options.dryRun && options.publishExisting) {
        throw new Error('publishExisting cannot be combined with dryRun');
    }
    const startedAt = new Date().toISOString();
    const dryRun = options.dryRun === true;
    const sources = selectScraperSources(getScraperSources(), options.onlySource);
    const results: SourceRunResult[] = [];

    for (const source of sources) {
        try {
            if (options.publishExisting && source.autoPublish !== true) {
                throw new Error(`Source "${source.name}" must enable autoPublish before publishing existing drafts`);
            }
            const crawled = source.kind === 'annex'
                ? { ...(await crawlAnnex(source)), errors: [] }
                : { ...(await crawlJsonLdSource(source)), complete: false, totalPages: null };
            const stored = await storeScrapedJobs(crawled.jobs, dryRun, source.autoPublish === true);
            const currentSourceJobIds = crawled.jobs.map(job => job.sourceJobId);
            const refreshed = !dryRun
                ? await refreshSeenScrapedJobs(source.name, currentSourceJobIds)
                : 0;
            const published = !dryRun && options.publishExisting
                ? await publishExistingScrapedJobs(source.name, currentSourceJobIds)
                : 0;
            const deactivated = !dryRun
                && source.autoPublish === true
                && crawled.complete
                ? await deactivateStaleAutoPublishedJobs(source.name)
                : 0;
            results.push({
                source: source.name,
                pagesVisited: crawled.pagesVisited,
                totalPages: crawled.totalPages,
                complete: crawled.complete,
                discovered: crawled.jobs.length,
                insertedOrUpdated: stored,
                refreshed,
                published,
                deactivated,
                skipped: 0,
                errors: crawled.errors,
            });
        } catch (error) {
            results.push({
                source: source.name,
                pagesVisited: 0,
                totalPages: null,
                complete: false,
                discovered: 0,
                insertedOrUpdated: 0,
                refreshed: 0,
                published: 0,
                deactivated: 0,
                skipped: 0,
                errors: [error instanceof Error ? error.message : 'Unknown crawler error'],
            });
        }
    }

    const failed = results.filter(result => result.errors.length > 0).length;
    const status = failed === 0 ? 'success' : failed === results.length ? 'failed' : 'partial';
    const finishedAt = new Date().toISOString();

    await recordScraperRun({ startedAt, finishedAt, dryRun, results, status });
    return {
        success: status !== 'failed',
        status,
        dryRun,
        startedAt,
        finishedAt,
        configuredSources: sources.length,
        totals: results.reduce((total, result) => ({
            pagesVisited: total.pagesVisited + result.pagesVisited,
            discovered: total.discovered + result.discovered,
            insertedOrUpdated: total.insertedOrUpdated + result.insertedOrUpdated,
            refreshed: total.refreshed + result.refreshed,
            published: total.published + result.published,
            deactivated: total.deactivated + result.deactivated,
        }), { pagesVisited: 0, discovered: 0, insertedOrUpdated: 0, refreshed: 0, published: 0, deactivated: 0 }),
        sources: results,
    };
}

export function selectScraperSources(sources: ReturnType<typeof getScraperSources>, onlySource?: string) {
    const selected = sources.filter(source => !onlySource || source.name === onlySource);
    if (selected.length === 0) {
        throw new Error(
            onlySource
                ? `No enabled scraper source named "${onlySource}"`
                : 'No enabled scraper sources configured',
        );
    }
    return selected;
}

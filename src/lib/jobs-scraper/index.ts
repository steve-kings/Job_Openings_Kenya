import { crawlAnnex } from './annex';
import { getScraperSources } from './config';
import { crawlJsonLdSource } from './crawler';
import { recordScraperRun, storeScrapedJobs } from './store';
import type { SourceRunResult } from './types';

export async function runJobScraper(options: { dryRun?: boolean; onlySource?: string } = {}) {
    const startedAt = new Date().toISOString();
    const dryRun = options.dryRun === true;
    const sources = getScraperSources().filter(source => !options.onlySource || source.name === options.onlySource);
    const results: SourceRunResult[] = [];

    for (const source of sources) {
        try {
            const crawled = source.kind === 'annex'
                ? { ...(await crawlAnnex(source)), errors: [] }
                : await crawlJsonLdSource(source);
            const stored = await storeScrapedJobs(crawled.jobs, dryRun, source.autoPublish === true);
            results.push({
                source: source.name,
                pagesVisited: crawled.pagesVisited,
                discovered: crawled.jobs.length,
                insertedOrUpdated: stored,
                skipped: 0,
                errors: crawled.errors,
            });
        } catch (error) {
            results.push({
                source: source.name,
                pagesVisited: 0,
                discovered: 0,
                insertedOrUpdated: 0,
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
        }), { pagesVisited: 0, discovered: 0, insertedOrUpdated: 0 }),
        sources: results,
    };
}

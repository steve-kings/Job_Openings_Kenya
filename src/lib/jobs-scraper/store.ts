import { createAdminClient } from '@/lib/supabase/admin';
import type { ScrapedJob } from './types';

const BATCH_SIZE = 100;
export const STALE_LISTING_GRACE_HOURS = 12;

export async function storeScrapedJobs(jobs: ScrapedJob[], dryRun: boolean, autoPublish: boolean): Promise<number> {
    const uniqueJobs = deduplicateScrapedJobs(jobs);
    if (dryRun || uniqueJobs.length === 0) return 0;
    const supabase = createAdminClient();
    let stored = 0;
    const scrapedAt = new Date().toISOString();

    for (let offset = 0; offset < uniqueJobs.length; offset += BATCH_SIZE) {
        const jobsBatch = uniqueJobs.slice(offset, offset + BATCH_SIZE);
        const batch = jobsBatch.map(job => toOpportunity(job, autoPublish, scrapedAt));
        // Existing rows are deliberately ignored so a recurring import cannot
        // overwrite an administrator's edits, publication status, or closure.
        const { data: inserted, error: insertError } = await supabase
            .from('opportunities')
            .upsert(batch, { onConflict: 'source,source_job_id', ignoreDuplicates: true })
            .select('source_job_id');
        if (insertError) throw new Error(`Supabase insert failed: ${insertError.message}`);
        stored += inserted?.length || 0;
    }
    return stored;
}

export async function publishExistingScrapedJobs(source: string, sourceJobIds: string[]): Promise<number> {
    const uniqueIds = [...new Set(sourceJobIds)];
    if (uniqueIds.length === 0) return 0;
    const supabase = createAdminClient();
    let published = 0;

    for (let offset = 0; offset < uniqueIds.length; offset += BATCH_SIZE) {
        const { data, error } = await supabase
            .from('opportunities')
            .update({ status: 'active' })
            .eq('source', source)
            .eq('status', 'draft')
            .is('created_by', null)
            .in('source_job_id', uniqueIds.slice(offset, offset + BATCH_SIZE))
            .select('id');
        if (error) throw new Error(`Unable to publish existing scraped jobs: ${error.message}`);
        published += data?.length || 0;
    }

    return published;
}

export async function refreshSeenScrapedJobs(
    source: string,
    sourceJobIds: string[],
    seenAt: string = new Date().toISOString(),
): Promise<number> {
    const uniqueIds = [...new Set(sourceJobIds)];
    if (uniqueIds.length === 0) return 0;
    const supabase = createAdminClient();
    let refreshed = 0;

    for (let offset = 0; offset < uniqueIds.length; offset += BATCH_SIZE) {
        const { data, error } = await supabase
            .from('opportunities')
            .update({ last_seen_at: seenAt })
            .eq('source', source)
            .is('created_by', null)
            .in('source_job_id', uniqueIds.slice(offset, offset + BATCH_SIZE))
            .select('id');
        if (error) throw new Error(`Unable to refresh scraped jobs: ${error.message}`);
        refreshed += data?.length || 0;
    }

    return refreshed;
}

export async function deactivateStaleAutoPublishedJobs(
    source: string,
    staleBefore: string = staleListingCutoff(),
): Promise<number> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('opportunities')
        .update({ status: 'expired' })
        .eq('source', source)
        .eq('status', 'active')
        .is('created_by', null)
        .lt('last_seen_at', staleBefore)
        .select('id');
    if (error) throw new Error(`Unable to expire stale auto-published jobs: ${error.message}`);
    return data?.length || 0;
}

export function staleListingCutoff(now: Date = new Date()): string {
    return new Date(now.getTime() - STALE_LISTING_GRACE_HOURS * 60 * 60 * 1000).toISOString();
}

export function deduplicateScrapedJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const unique = new Map<string, ScrapedJob>();
    for (const job of jobs) unique.set(`${job.source}\u0000${job.sourceJobId}`, job);
    return [...unique.values()];
}

export async function recordScraperRun(input: {
    startedAt: string;
    finishedAt: string;
    dryRun: boolean;
    results: unknown;
    status: 'success' | 'partial' | 'failed';
}): Promise<void> {
    if (input.dryRun) return;
    const supabase = createAdminClient();
    const { error } = await supabase.from('job_scraper_runs').insert({
        started_at: input.startedAt,
        finished_at: input.finishedAt,
        status: input.status,
        results: input.results,
    });
    if (error) throw new Error(`Unable to record scraper run: ${error.message}`);
}

function toOpportunity(job: ScrapedJob, autoPublish: boolean, scrapedAt: string) {
    const today = new Date().toISOString().slice(0, 10);
    return {
        title: job.title,
        type: 'Job',
        company: job.company,
        location: job.location,
        description: job.description,
        short_description: job.shortDescription,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        deadline: job.deadline,
        apply_url: job.applyUrl,
        status: initialOpportunityStatus(job.deadline, autoPublish, today),
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        salary_currency: job.salaryCurrency || 'KES',
        thumbnail_url: job.thumbnailUrl,
        source: job.source,
        source_job_id: job.sourceJobId,
        source_url: job.sourceUrl,
        scraped_at: scrapedAt,
        last_seen_at: scrapedAt,
        created_at: job.postedAt || new Date().toISOString(),
        updated_at: scrapedAt,
    };
}

export function initialOpportunityStatus(
    deadline: string | null,
    autoPublish: boolean,
    today: string = new Date().toISOString().slice(0, 10),
): 'active' | 'draft' | 'expired' {
    if (deadline && deadline < today) return 'expired';
    return autoPublish ? 'active' : 'draft';
}

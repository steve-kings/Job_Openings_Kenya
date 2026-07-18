import { createAdminClient } from '@/lib/supabase/admin';
import type { ScrapedJob } from './types';

const BATCH_SIZE = 100;

export async function storeScrapedJobs(jobs: ScrapedJob[], dryRun: boolean, autoPublish: boolean): Promise<number> {
    if (dryRun || jobs.length === 0) return 0;
    const supabase = createAdminClient();
    let stored = 0;

    for (let offset = 0; offset < jobs.length; offset += BATCH_SIZE) {
        const batch = jobs.slice(offset, offset + BATCH_SIZE).map(job => toOpportunity(job, autoPublish));
        const { error } = await supabase
            .from('opportunities')
            .upsert(batch, { onConflict: 'source,source_job_id', ignoreDuplicates: false });
        if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
        stored += batch.length;
    }
    return stored;
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

function toOpportunity(job: ScrapedJob, autoPublish: boolean) {
    const today = new Date().toISOString().slice(0, 10);
    const isExpired = !!job.deadline && job.deadline < today;
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
        status: isExpired ? 'expired' : autoPublish ? 'active' : 'draft',
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        salary_currency: job.salaryCurrency || 'KES',
        thumbnail_url: job.thumbnailUrl,
        source: job.source,
        source_job_id: job.sourceJobId,
        source_url: job.sourceUrl,
        scraped_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        created_at: job.postedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

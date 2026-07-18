-- Metadata used to deduplicate and audit externally crawled job listings.
ALTER TABLE public.opportunities
    ADD COLUMN IF NOT EXISTS source TEXT,
    ADD COLUMN IF NOT EXISTS source_job_id TEXT,
    ADD COLUMN IF NOT EXISTS source_url TEXT,
    ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_source_job
    ON public.opportunities(source, source_job_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_last_seen
    ON public.opportunities(last_seen_at DESC)
    WHERE source IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.job_scraper_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    results JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.job_scraper_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.job_scraper_runs FROM anon, authenticated;
GRANT ALL ON public.job_scraper_runs TO service_role;

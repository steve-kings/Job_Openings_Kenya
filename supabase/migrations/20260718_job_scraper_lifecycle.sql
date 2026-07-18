-- Supports source-scoped retirement of automated listings after a complete crawl.
CREATE INDEX IF NOT EXISTS idx_opportunities_source_active_last_seen
    ON public.opportunities(source, last_seen_at)
    WHERE status = 'active' AND source IS NOT NULL;

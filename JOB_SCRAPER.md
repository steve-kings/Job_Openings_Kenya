# Job crawler

The crawler imports jobs from explicitly approved sources into the existing `opportunities` table. It is intentionally not an unrestricted web crawler.

## Supported source types

- `annex`: reads the public Annex jobs API.
- `jsonld`: follows same-host job/career links and extracts Schema.org `JobPosting` JSON-LD.

JSON-LD sources use HTTPS only, reject private network addresses, respect `robots.txt`, limit response size, cap redirects, wait between requests, and crawl a maximum number of pages.

## Setup

1. Apply `supabase/migrations/20260718_job_scraper.sql` in Supabase.
2. Set `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `JOB_SCRAPER_SOURCES_JSON` in Vercel.
3. Confirm that each website permits automated crawling and republication before adding it.

Example configuration (store it as one line):

```json
[
  {
    "name": "annex",
    "kind": "annex",
    "maxPages": 3,
    "autoPublish": false,
    "enabled": true
  },
  {
    "name": "approved-employer",
    "kind": "jsonld",
    "startUrls": ["https://careers.example.com/jobs"],
    "maxPages": 20,
    "requestDelayMs": 1000,
    "autoPublish": false,
    "enabled": true
  }
]
```

The crawler runs every six hours through Vercel Cron. Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically.

## Manual dry run

Use a dry run before enabling writes:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://jobopenings.co.ke/api/cron/jobs-scraper?dryRun=true"
```

Limit a run to one configured source with `?source=annex`. Remove `dryRun=true` only after reviewing discovered and error counts.

## Operating rules

- Do not add LinkedIn, Google search results, or another website whose terms prohibit scraping.
- Prefer employer career pages, public APIs, RSS feeds, and explicit data partnerships.
- Imported jobs retain their original application URL and source metadata.
- Imported jobs are drafts by default. Set `autoPublish` only for a source trusted enough to bypass moderation.
- Keep external listings visibly identified; ingestion does not make a listing independently verified.
- Review `job_scraper_runs` for source failures and unexpected volume.

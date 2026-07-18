# Job crawler

The crawler imports jobs from explicitly approved sources into the existing `opportunities` table. It is intentionally not an unrestricted web crawler.

## Supported source types

- `annex`: reads the public Annex jobs API.
- `jsonld`: follows same-host job/career links and extracts Schema.org `JobPosting` JSON-LD.

Annex sources default to `location: "Kenya"`. Keep the location explicit in production configuration so the allowlist is easy to audit.

JSON-LD sources use HTTPS only, reject private network addresses, respect `robots.txt`, limit response size, cap redirects, wait between requests, and crawl a maximum number of pages.

## Setup

1. Apply `supabase/migrations/20260718_job_scraper.sql` and `supabase/migrations/20260718_job_scraper_lifecycle.sql` in Supabase, in that order.
2. Set `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `JOB_SCRAPER_SOURCES_JSON` in Vercel.
3. Confirm that each website permits automated crawling and republication before adding it.

Example configuration (store it as one line):

```json
[
  {
    "name": "annex",
    "kind": "annex",
    "location": "Kenya",
    "maxPages": 3,
    "maxAgeDays": 90,
    "minimumDescriptionLength": 160,
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

On Vercel, the crawler runs every six hours through Vercel Cron. Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically. A PM2/VPS deployment does not execute `vercel.json`; configure the Linux cron described below.

## Manual dry run

Use a dry run before enabling writes:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://jobopenings.co.ke/api/cron/jobs-scraper?dryRun=true"
```

Limit a run to one configured source with `?source=annex`. Remove `dryRun=true` only after reviewing discovered and error counts.

## PM2/VPS schedule

After applying the migration and setting the three required environment variables, restart the application so it reloads `.env.local`:

```bash
pm2 restart jobopenings --update-env
```

Install the protected curl configuration and one idempotent six-hour cron entry:

```bash
cd /home/kings/jobopenings
bash scripts/install-job-scraper-cron.sh
```

The installer reads `.env.local` without exposing the bearer secret in `crontab` or process arguments. It runs an authenticated dry run first and installs cron only if that succeeds. It also uses a lock so overlapping runs cannot occur. If it reports that cron is inactive, run the command it prints.

Test the Kenya source without writing to Supabase:

```bash
bash scripts/run-job-scraper.sh --dry-run
```

Require `success: true`, `configuredSources: 1`, no source errors, and preferably `discovered` greater than zero. `insertedOrUpdated: 0` is expected for a dry run. A dry run does not test Supabase writes or prove that the migration was applied. The installer already performs this test; the command is also available for later diagnostics.

After the migration is applied, perform one live draft import and inspect its result:

```bash
bash scripts/run-job-scraper.sh
```

Confirm that the entry exists exactly once and inspect recent scheduler output with:

```bash
crontab -l | grep -Fc '# jobopenings-jobs-scraper'
journalctl -t jobopenings-scraper -n 50 --no-pager
```

The marker count must be `1`. Draft mode prevents external listings from appearing publicly without editorial review. Recurring runs preserve an administrator's existing publication status instead of demoting or reactivating a reviewed listing.

## Automatic publication

Automatic publication is an explicit opt-in. Change only the Annex source in `.env.local` to:

```env
JOB_SCRAPER_SOURCES_JSON=[{"name":"annex","kind":"annex","location":"Kenya","maxPages":3,"maxAgeDays":90,"minimumDescriptionLength":160,"autoPublish":true,"enabled":true}]
```

Restart the app and reinstall the protected scheduler configuration:

```bash
pm2 restart jobopenings --update-env
bash scripts/install-job-scraper-cron.sh
```

New eligible jobs are then inserted with `active` status. Existing imported drafts are not silently promoted during normal cron runs, so a later editorial decision remains intact. To publish only the existing drafts that are still present in the current eligible Kenya feed, run this one-time authenticated action:

```bash
bash scripts/run-job-scraper.sh --publish-existing
```

Each successful run refreshes `last_seen_at` for eligible imported records. Only after a complete Annex crawl, an active automated listing that has remained unseen for at least 12 hours is marked expired. The grace period protects against temporary pagination changes or a single incomplete source response. Draft, closed, inactive, expired, and manually created records are not reactivated by normal scheduled runs.

## Operating rules

- Do not add LinkedIn, Google search results, or another website whose terms prohibit scraping.
- Prefer employer career pages, public APIs, RSS feeds, and explicit data partnerships.
- Imported jobs retain their original application URL and source metadata.
- Imported jobs are drafts by default. Set `autoPublish` only for a source trusted enough to bypass moderation.
- Keep external listings visibly identified; ingestion does not make a listing independently verified.
- Review `job_scraper_runs` for source failures and unexpected volume.

# AdSense review checklist

AdSense approval is a manual Google decision. These checks improve technical readiness and content quality, but no code change can guarantee approval.

## What the repository now enforces

- The publisher ID is centralized in `src/lib/adsense.ts` and used by both the ownership meta tag and the global AdSense loader.
- `public/ads.txt` identifies the same publisher account.
- Manual ad components do not render when their slot is missing, malformed, or still set to `PLACEHOLDER_SLOT_ID`.
- Private dashboards, admin/API routes, account forms, and content-creation forms send an `X-Robots-Tag` that prevents indexing.
- Expired, draft, missing, and very sparse job pages are not submitted for indexing.
- Draft or missing blog posts return a real 404. Very short posts remain readable but are not submitted for indexing until expanded.
- Published articles are readable without requiring an account.
- The third-party news feed is `noindex, follow`; it remains available to visitors without being presented to search engines as original reporting.
- The sitemap lists canonical, substantive pages and includes `/career-guides`; it does not list the `/jobs` redirect.

## Before deploying

1. Set `NEXT_PUBLIC_SITE_URL=https://jobopenings.co.ke` in the production environment.
2. Replace every manual AdSense placeholder with a real numeric ad-unit slot, or leave the slot empty so the component stays disabled. Current placeholders must never be treated as live slots.
3. Publish a useful body, accurate source/application information, and a current deadline for each job. A title plus a few generic lines is not enough.
4. Review published blog posts for original reporting, practical examples, clear authorship, and enough depth to answer the headline.
5. Keep About, Contact, Privacy, Terms, Editorial Policy, and Career Guides reachable from normal site navigation.
6. Confirm that job descriptions, logos, and third-party material may be republished. Link to the responsible employer/application source and remove content when requested.
7. Rotate any secrets that have been shared in chat, screenshots, source control, or logs before deployment.

## Verify the deployed domain

Deploy the current code first. A local fix does not change the public site, and the PWA service worker or CDN may temporarily serve an older build. Test in a private window after deployment.

Run these read-only PowerShell checks:

```powershell
(Invoke-WebRequest -UseBasicParsing https://jobopenings.co.ke/ads.txt).Content

$page = (Invoke-WebRequest -UseBasicParsing https://jobopenings.co.ke/).Content
$page -match 'google-adsense-account'
$page -match 'ca-pub-4495535130517390'

(Invoke-WebRequest -UseBasicParsing https://jobopenings.co.ke/robots.txt).Content
(Invoke-WebRequest -UseBasicParsing https://jobopenings.co.ke/sitemap.xml).Content

(Invoke-WebRequest -Method Head -UseBasicParsing https://jobopenings.co.ke/login).Headers['X-Robots-Tag']
```

Expected results:

- `ads.txt` returns HTTP 200 and exactly the intended Google publisher record.
- The homepage source contains the AdSense account meta tag and the same publisher ID.
- `robots.txt` references the production sitemap.
- The sitemap uses only `https://jobopenings.co.ke` URLs and contains `/career-guides`.
- Private or utility pages return the intended `X-Robots-Tag` after deployment.
- The `www` host permanently redirects to the chosen non-`www` host.

Also use AdSense's own verification screen and URL inspection tools after the live checks pass. If the live page source still lacks the ownership tag, do not request another review yet; confirm the production deployment and domain assignment first.

## Editorial review before resubmission

- Remove or expand empty category pages, sparse company pages, one-line articles, and jobs with missing application detail.
- Do not mass-publish crawler output. Keep imported jobs in draft until a person verifies the employer, application URL, content quality, and deadline.
- Add first-party value around listings: a concise role summary, who the role may suit, application steps, source attribution, and safety notes where relevant. Do not invent employer facts.
- Fix broken links, missing images, encoding problems, mobile overflow, and pages that render a friendly “not found” message with HTTP 200.
- Make sure navigation works without login and that the main content is visible before ads.
- Do not click your own ads, encourage ad clicks, disguise ads as navigation, or place ads where they can be mistaken for application buttons.
- Maintain the privacy/consent configuration appropriate to the visitor's region and the ad products enabled in the AdSense account.

After these checks pass on the live production domain, request a review in AdSense. If Google returns another low-value-content decision, use the affected-URL examples (if provided) to expand or exclude those exact page types before requesting the next review.

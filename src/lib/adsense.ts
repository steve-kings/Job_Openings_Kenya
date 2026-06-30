// Google AdSense publisher ID for the site.
//
// Hardcoded on purpose: NEXT_PUBLIC_* env vars are inlined at *build* time, so a
// stale value baked into a server build (or a leftover env var on the host) can
// silently keep serving the wrong publisher. Keeping the ID in code guarantees
// the correct account is in every served page. To switch accounts, change it here.
export const ADSENSE_CLIENT_ID = 'ca-pub-4495535130517390';

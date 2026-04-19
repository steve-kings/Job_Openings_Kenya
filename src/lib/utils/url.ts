export function getBaseUrl() {
    // 1. If we are in the browser, always use the active domain
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // 2. If the user explicitly set NEXT_PUBLIC_SITE_URL in env vars (e.g., custom domain in Vercel settings)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') 
            ? process.env.NEXT_PUBLIC_SITE_URL 
            : `https://${process.env.NEXT_PUBLIC_SITE_URL}`;
    }

    // 3. Fallback to Vercel's production URL (this matches any custom domain attached as Primary in Vercel)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // 4. Fallback to Vercel's preview/deployment URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 5. Default local dev fallback
    return 'http://localhost:3000';
}

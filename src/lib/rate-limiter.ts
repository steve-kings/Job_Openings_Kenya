/**
 * In-memory rate limiter for API routes.
 * Uses a sliding-window approach with per-IP tracking.
 * For production with multiple serverless instances, consider
 * migrating to @upstash/ratelimit or a Redis-backed solution.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 60 seconds)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now >= entry.resetAt) {
                store.delete(key);
            }
        }
    }, 60_000);
}

export interface RateLimitConfig {
    /** Max requests allowed within the window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
    /** Identifier for the client (usually IP address) */
    identifier?: string;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp in ms
}

/**
 * Check if a request should be rate limited.
 * Returns the result with remaining count and reset time.
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
    const { maxRequests, windowMs, identifier = 'global' } = config;
    const now = Date.now();
    const key = identifier;

    let entry = store.get(key);

    // Create new entry if none exists or if window has expired
    if (!entry || now >= entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
        store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    return {
        success,
        limit: maxRequests,
        remaining,
        reset: entry.resetAt,
    };
}

/**
 * Extract a client identifier from a Request object.
 * Falls back to IP from headers or 'unknown'.
 */
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const path = new URL(request.url).pathname;
    return `${ip}:${path}`;
}

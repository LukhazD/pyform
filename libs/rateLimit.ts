/**
 * Simple in-memory rate limiter for API routes.
 *
 * ⚠️  PRODUCTION LIMITATION: In serverless environments (Vercel, AWS Lambda),
 * each function invocation may run in a different instance. This in-memory Map
 * is NOT shared across instances, so rate limiting is best-effort only.
 *
 * For reliable rate limiting in production, replace with:
 * - Vercel KV (Redis-compatible) with sliding window counters
 * - Upstash Redis (@upstash/ratelimit package)
 * - Cloudflare Rate Limiting (if using CF as CDN)
 *
 * This implementation still protects against single-instance burst attacks
 * and is acceptable for launch if traffic is moderate.
 */

const rateLimitMap = new Map<string, number[]>();

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g., IP address or formId)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(key) || [];
    const windowStart = now - windowMs;

    const recentTimestamps = timestamps.filter(t => t > windowStart);

    if (recentTimestamps.length >= limit) {
        rateLimitMap.set(key, recentTimestamps);
        return false;
    }

    recentTimestamps.push(now);
    rateLimitMap.set(key, recentTimestamps);
    return true;
}

// Periodic cleanup to prevent memory leaks (every 60s)
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        const maxWindow = 120_000; // 2 minutes
        for (const [key, timestamps] of rateLimitMap.entries()) {
            const filtered = timestamps.filter(t => t > now - maxWindow);
            if (filtered.length === 0) {
                rateLimitMap.delete(key);
            } else {
                rateLimitMap.set(key, filtered);
            }
        }
    }, 60_000).unref?.();
}

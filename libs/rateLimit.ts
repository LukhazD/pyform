/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, replace with Redis-based rate limiting.
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

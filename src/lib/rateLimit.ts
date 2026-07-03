interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

/**
 * In-memory sliding-window limiter. Good enough for a single-instance
 * deployment or demo; a multi-instance deployment would need a shared
 * store (Redis, Upstash) behind the same interface.
 */
export function checkRateLimit(
  key: string,
  now = Date.now(),
): { allowed: boolean; remaining: number; resetAt: number } {
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.windowStart + WINDOW_MS,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - existing.count,
    resetAt: existing.windowStart + WINDOW_MS,
  };
}

export function resetRateLimitStore(): void {
  buckets.clear();
}

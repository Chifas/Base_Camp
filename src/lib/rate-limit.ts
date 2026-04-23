import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting with graceful degradation.
 * If Upstash Redis is not configured, rate limiting is skipped silently.
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

function createLimiter(
  prefix: string,
  limiter: ReturnType<typeof Ratelimit.slidingWindow>
): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  return new Ratelimit({ redis: r, limiter, prefix });
}

// POST /api/auth/[...nextauth] (credentials login) — max 10 per 15min per IP
export const loginLimiter = () =>
  createLimiter("rl:login", Ratelimit.slidingWindow(10, "15 m"));

// POST /api/register — max 5 per hour per IP
export const registerLimiter = () =>
  createLimiter("rl:register", Ratelimit.slidingWindow(5, "1 h"));

// POST /api/reviews — max 3 per day per user
export const reviewLimiter = () =>
  createLimiter("rl:review", Ratelimit.slidingWindow(3, "24 h"));

// GET /api/professionals — max 60 per minute per IP
export const professionalsLimiter = () =>
  createLimiter("rl:professionals", Ratelimit.slidingWindow(60, "1 m"));

/**
 * Extract client IP from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return (forwarded.split(",")[0] ?? forwarded).trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Check rate limit. Returns { success: true } if allowed or if Redis is not configured.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!limiter) {
    // No Redis configured — allow all requests
    return { success: true };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // Redis error — fail open (allow request)
    console.warn("[rate-limit] Redis error, allowing request");
    return { success: true };
  }
}

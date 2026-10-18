import "server-only";

const CAPACITY = 20;
const WINDOW_MS = 60 * 60 * 1000;
const REFILL_PER_MS = CAPACITY / WINDOW_MS;

type Bucket = { tokens: number; updated: number };

const globalBuckets = globalThis as unknown as { __copycartBuckets?: Map<string, Bucket> };
const buckets = globalBuckets.__copycartBuckets ?? new Map<string, Bucket>();
globalBuckets.__copycartBuckets = buckets;

export async function consumeRateLimit(userId: string) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(CAPACITY, "1 h"),
      prefix: "copycart",
    });
    const result = await ratelimit.limit(`ai:${userId}`);
    return { ok: result.success, remaining: result.remaining };
  }

  const now = Date.now();
  const current = buckets.get(userId) ?? { tokens: CAPACITY, updated: now };
  const refilled = Math.min(CAPACITY, current.tokens + (now - current.updated) * REFILL_PER_MS);
  if (refilled < 1) {
    buckets.set(userId, { tokens: refilled, updated: now });
    return { ok: false, remaining: 0 };
  }
  const next = refilled - 1;
  buckets.set(userId, { tokens: next, updated: now });
  return { ok: true, remaining: Math.floor(next) };
}

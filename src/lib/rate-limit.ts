import Redis from "ioredis";

let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL or UPSTASH_REDIS_REST_URL environment variable is required for rate limiting");
    }
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });
  }
  return redis;
}

export async function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  // Fallback to in-memory for development if Redis is not configured
  if (process.env.NODE_ENV === "development" && !process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    const buckets = globalThis as unknown as { rateLimitBuckets?: Map<string, { count: number; resetAt: number }> };
    if (!buckets.rateLimitBuckets) {
      buckets.rateLimitBuckets = new Map();
    }
    const now = Date.now();
    const bucket = buckets.rateLimitBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      buckets.rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }
    bucket.count += 1;
    return { ok: bucket.count <= limit };
  }

  try {
    const client = getRedisClient();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline();
    pipeline.zremrangebyscore(key, "-inf", windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    if (!results) {
      throw new Error("Redis pipeline failed");
    }
    
    const count = results[1][1] as number;
    const newCount = count + 1;
    
    return { ok: newCount <= limit, remaining: Math.max(0, limit - newCount), reset: now + windowMs };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if rate limiting fails
    return { ok: true };
  }
}

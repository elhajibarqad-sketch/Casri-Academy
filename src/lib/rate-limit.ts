import Redis from "ioredis";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  reset: number;
  store: "redis" | "upstash" | "database" | "memory";
};

let redis: Redis | null = null;
let warnedMemory = false;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function redisClient() {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      retryStrategy: (attempt) => Math.min(attempt * 100, 1000),
    });
  }
  return redis;
}

async function upstashCommand<T>(command: unknown[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash REST rate limiter is not configured.");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || data.error) throw new Error(data.error ?? "Upstash rate limiter request failed.");
  return data.result as T;
}

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  if (process.env.NODE_ENV === "production" && !warnedMemory) {
    warnedMemory = true;
    logger.warn("Using in-process rate limiting. Configure REDIS_URL or UPSTASH_REDIS_REST_URL for multi-instance production.");
  }

  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), reset: resetAt, store: "memory" };
  }

  bucket.count += 1;
  return { ok: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), reset: bucket.resetAt, store: "memory" };
}

async function redisRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const client = redisClient();
  if (!client) throw new Error("Redis URL is not configured.");

  const now = Date.now();
  const resetAt = now + windowMs;
  const count = await client.incr(key);
  if (count === 1) await client.pexpire(key, windowMs);
  const ttl = await client.pttl(key);
  return { ok: count <= limit, remaining: Math.max(0, limit - count), reset: ttl > 0 ? now + ttl : resetAt, store: "redis" };
}

async function upstashRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + windowMs;
  const count = Number(await upstashCommand<number>(["INCR", key]));
  if (count === 1) await upstashCommand(["PEXPIRE", key, windowMs]);
  const ttl = Number(await upstashCommand<number>(["PTTL", key]));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), reset: ttl > 0 ? now + ttl : resetAt, store: "upstash" };
}

async function databaseRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const [bucket] = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("id", "key", "count", "resetAt", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${key}, 1, ${resetAt}, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "resetAt";
  `;

  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.resetAt.getTime(),
    store: "database",
  };
}

export async function rateLimit(key: string, limit = 20, windowMs = 60_000): Promise<RateLimitResult> {
  try {
    if (process.env.REDIS_URL) return await redisRateLimit(key, limit, windowMs);
    if (process.env.UPSTASH_REDIS_REST_URL) return await upstashRateLimit(key, limit, windowMs);
    return await databaseRateLimit(key, limit, windowMs);
  } catch (error) {
    logger.error({ error, key }, "Rate limiter store failed; falling back to memory limiter");
    return memoryRateLimit(key, limit, windowMs);
  }
}

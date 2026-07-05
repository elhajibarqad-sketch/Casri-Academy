import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import Redis from "ioredis";

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redisClient && (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL)) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry for health check
    });
  }
  return redisClient;
}

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
      config: "ok",
    },
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "ok";
  } catch (error) {
    health.services.database = "error";
    health.status = "degraded";
    logger.error({ error }, "Database health check failed");
  }

  // Check Redis connection (if configured)
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      health.services.redis = "ok";
    } else {
      health.services.redis = "not_configured";
    }
  } catch (error) {
    health.services.redis = "error";
    health.status = "degraded";
    logger.error({ error }, "Redis health check failed");
  }

  // Check critical configuration
  const requiredEnvVars = ["DATABASE_URL", "AUTH_SECRET", "APP_URL"];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    health.services.config = "error";
    health.status = "unhealthy";
    logger.error({ missingVars }, "Critical environment variables missing");
  }

  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 503 : 503;

  return NextResponse.json(health, { status: statusCode });
}

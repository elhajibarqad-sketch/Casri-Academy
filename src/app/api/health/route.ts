import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getProviderStatus, validateEnv } from "@/lib/env";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      rateLimit: "unknown",
      config: "ok",
      firebase: "unknown",
      payment: "unknown",
      media: "unknown",
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

  try {
    validateEnv();
    const providers = getProviderStatus();
    health.services.rateLimit = providers.rateLimitStore;
    health.services.firebase = providers.firebaseConfigured ? "configured" : "not_configured";
    health.services.payment = providers.paymentProvider;
    health.services.media = providers.mediaProvider;
  } catch (error) {
    health.services.config = "error";
    health.status = "unhealthy";
    logger.error({ error }, "Configuration health check failed");
  }

  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 503 : 503;

  return NextResponse.json(health, { status: statusCode });
}

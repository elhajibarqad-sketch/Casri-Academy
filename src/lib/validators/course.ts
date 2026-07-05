import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(160),
  subtitle: z.string().trim().min(10).max(220),
  description: z.string().trim().min(30),
  category: z.enum([
    "FOREX_BASICS",
    "TECHNICAL_ANALYSIS",
    "RISK_MANAGEMENT",
    "CRYPTO_BASICS",
    "BLOCKCHAIN",
    "TRADING_PSYCHOLOGY",
  ]),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  priceCents: z.number().int().min(0).max(50_000_00),
  instructor: z.string().trim().min(2).max(100),
  duration: z.string().trim().min(2).max(40),
  outcomes: z.array(z.string().trim().min(3).max(120)).min(1).max(8),
  thumbnail: z.string().url().optional().or(z.literal("")),
});

export const courseUpdateSchema = courseSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(160),
  summary: z.string().trim().min(10).max(500),
  videoUrl: z.string().url().optional().or(z.literal("")),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).max(500),
  isFree: z.boolean().default(false),
  durationMin: z.number().int().min(1).max(600),
});

import { z } from "zod";

const optionalBooleanField = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === true || value === "true");

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
  adminOnly: optionalBooleanField,
});

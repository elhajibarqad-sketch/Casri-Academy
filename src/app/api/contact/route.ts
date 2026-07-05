import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { validateCsrfToken } from "@/lib/auth/session";
import { sanitizeInput, sanitizeText } from "@/lib/sanitize";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  topic: z.string().min(2).max(120),
  message: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!(await rateLimit(`contact:${ip}`, 5)).ok) return NextResponse.json({ error: "Too many messages." }, { status: 429 });

  // CSRF protection
  if (!validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const form = await request.formData();
  const parsed = contactSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ error: "Invalid contact form." }, { status: 400 });

  // Sanitize user input
  const sanitizedData = {
    name: sanitizeInput(parsed.data.name),
    email: sanitizeInput(parsed.data.email),
    topic: sanitizeInput(parsed.data.topic),
    message: sanitizeText(parsed.data.message),
  };

  await prisma.contactMessage.create({ data: sanitizedData });
  return NextResponse.redirect(new URL("/contact?sent=1", request.url));
}

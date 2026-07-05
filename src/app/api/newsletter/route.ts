import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`newsletter:${ip}`, 8).ok) {
    return NextResponse.json({ error: "Too many subscription attempts." }, { status: 429 });
  }

  const parsed = newsletterSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Subscription received. Connect this route to your email provider before production email delivery.",
  });
}

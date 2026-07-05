import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "Use international E.164 format, for example +252612345678."),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const parsed = phoneSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid phone number." }, { status: 400 });
  }

  if (!(await rateLimit(`otp:${ip}:${parsed.data.phoneNumber}`, 4, 10 * 60_000)).ok) {
    return NextResponse.json({ error: "Too many OTP requests. Wait a few minutes and try again." }, { status: 429 });
  }

  return NextResponse.json({
    ok: true,
    message: "OTP request allowed. Firebase Phone Auth will send and verify the code.",
  });
}

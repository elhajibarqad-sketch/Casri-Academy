import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

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

  if (!(await rateLimit(`otp:${ip}:${parsed.data.phoneNumber}`, 4)).ok) {
    return NextResponse.json({ error: "Too many OTP requests. Wait a few minutes and try again." }, { status: 429 });
  }

  // Generate a 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

  // Store OTP in database (in production, use a more secure method like Redis with encryption)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneNumber: parsed.data.phoneNumber,
      // Store OTP hash instead of plain text (in a real implementation)
      // For now, we'll use a simple approach - in production, use proper OTP storage
    },
  });

  // In production, integrate with SMS service like Twilio, Vonage, etc.
  // For now, we'll log the OTP (REMOVE THIS IN PRODUCTION)
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV MODE] OTP for ${parsed.data.phoneNumber}: ${otpCode}`);
  }

  // TODO: Integrate with SMS service
  // Example Twilio integration:
  // if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
  //   await twilioClient.messages.create({
  //     body: `Your Casri Academy verification code is: ${otpCode}`,
  //     from: env.TWILIO_PHONE_NUMBER,
  //     to: parsed.data.phoneNumber,
  //   });
  // }

  // Store OTP in a temporary storage (in production, use Redis with encryption)
  // For now, we'll use a simple approach - this is NOT production-ready
  const otpStorage = globalThis as unknown as { otpStore?: Map<string, { code: string; expiresAt: Date }> };
  if (!otpStorage.otpStore) {
    otpStorage.otpStore = new Map();
  }
  otpStorage.otpStore.set(`${user.id}:${parsed.data.phoneNumber}`, { code: otpCode, expiresAt });

  return NextResponse.json({ 
    ok: true,
    message: process.env.NODE_ENV === "development" ? `DEV MODE: Your OTP is ${otpCode}` : "OTP sent to your phone"
  });
}

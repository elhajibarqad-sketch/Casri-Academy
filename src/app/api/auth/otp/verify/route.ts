import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

const otpVerifySchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "Use international E.164 format, for example +252612345678."),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits."),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const parsed = otpVerifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid OTP data." }, { status: 400 });
  }

  if (!(await rateLimit(`otp-verify:${ip}:${user.id}`, 10)).ok) {
    return NextResponse.json({ error: "Too many verification attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  // Retrieve OTP from temporary storage
  const otpStorage = globalThis as unknown as { otpStore?: Map<string, { code: string; expiresAt: Date }> };
  const storedOtp = otpStorage.otpStore?.get(`${user.id}:${parsed.data.phoneNumber}`);

  if (!storedOtp) {
    return NextResponse.json({ error: "OTP expired or not found. Please request a new OTP." }, { status: 400 });
  }

  if (storedOtp.expiresAt < new Date()) {
    otpStorage.otpStore?.delete(`${user.id}:${parsed.data.phoneNumber}`);
    return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
  }

  if (storedOtp.code !== parsed.data.code) {
    return NextResponse.json({ error: "Invalid OTP code." }, { status: 400 });
  }

  // OTP is valid - verify phone number
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneVerified: true,
      phoneNumber: parsed.data.phoneNumber,
    },
  });

  // Clear the used OTP
  otpStorage.otpStore?.delete(`${user.id}:${parsed.data.phoneNumber}`);

  // Update session with phone verification status
  const response = NextResponse.json({ ok: true, message: "Phone verified successfully" });
  setSessionCookie(response, await createSessionToken({ 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role, 
    phoneVerified: true, 
    status: user.status 
  }));

  return response;
}

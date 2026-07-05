import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

const sessionSchema = z.object({
  idToken: z.string().min(20),
});

function safeName(name: string | undefined, email: string) {
  return name?.trim() || email.split("@")[0] || "Casri Student";
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`firebase-session:${ip}`, 20).ok) {
    return NextResponse.json({ error: "Too many authentication attempts." }, { status: 429 });
  }

  const parsed = sessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid authentication request." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await getFirebaseAdminAuth().verifyIdToken(parsed.data.idToken, true);
  } catch {
    return NextResponse.json({ error: "Google authentication could not be verified." }, { status: 401 });
  }

  if (!decoded.email || !decoded.email_verified) {
    return NextResponse.json({ error: "Google email must be verified before continuing." }, { status: 403 });
  }

  if (!decoded.phone_number) {
    return NextResponse.json({ requiresPhoneVerification: true, redirectTo: "/verify-otp" }, { status: 202 });
  }

  const existingByUid = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
  const existingByEmail = await prisma.user.findUnique({ where: { email: decoded.email } });

  if (existingByEmail?.firebaseUid && existingByEmail.firebaseUid !== decoded.uid) {
    return NextResponse.json({ error: "This email is already linked to another authentication account." }, { status: 409 });
  }

  const user = await prisma.user.upsert({
    where: { id: existingByUid?.id ?? existingByEmail?.id ?? "__new_firebase_user__" },
    create: {
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: safeName(decoded.name, decoded.email),
      photoURL: decoded.picture,
      phoneNumber: decoded.phone_number,
      googleVerified: true,
      phoneVerified: true,
      status: "active",
      lastLoginAt: new Date(),
      profile: { create: { avatarUrl: decoded.picture ?? null, phone: decoded.phone_number } },
    },
    update: {
      firebaseUid: decoded.uid,
      name: safeName(decoded.name, decoded.email),
      photoURL: decoded.picture,
      phoneNumber: decoded.phone_number,
      googleVerified: true,
      phoneVerified: true,
      status: "active",
      lastLoginAt: new Date(),
      profile: {
        upsert: {
          create: { avatarUrl: decoded.picture ?? null, phone: decoded.phone_number },
          update: { avatarUrl: decoded.picture ?? null, phone: decoded.phone_number },
        },
      },
    },
  });

  const response = NextResponse.json({ ok: true, redirectTo: "/dashboard" });
  setSessionCookie(
    response,
    await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phoneVerified: user.phoneVerified,
      status: user.status,
    }),
  );
  return response;
}

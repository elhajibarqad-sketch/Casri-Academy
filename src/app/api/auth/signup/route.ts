import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, setCsrfCookie, validateCsrfToken } from "@/lib/auth/session";
import { signupSchema } from "@/lib/validators/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!(await rateLimit(`signup:${ip}`, 8)).ok) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  // CSRF protection
  if (!validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: "Email is already registered." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      profile: { create: {} },
    },
  });

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role, phoneVerified: user.phoneVerified, status: user.status }));
  setCsrfCookie(response);
  return response;
}

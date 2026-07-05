import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, setCsrfCookie, validateCsrfToken } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!(await rateLimit(`login:${ip}`, 12)).ok) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  // CSRF protection
  if (!validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role, phoneVerified: user.phoneVerified || user.role === "ADMIN", status: user.status }));
  setCsrfCookie(response);
  return response;
}

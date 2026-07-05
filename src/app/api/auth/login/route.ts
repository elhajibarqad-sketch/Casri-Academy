import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie, setCsrfCookie, validateCsrfToken } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { rateLimit } from "@/lib/rate-limit";

type LoginRequest = {
  payload: unknown;
  next: string;
  wantsJson: boolean;
};

function safeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function redirectForLoginIntent(next: string, adminOnly: boolean) {
  if (adminOnly) return next.startsWith("/admin") ? next : "/admin/dashboard";
  return next.startsWith("/admin") ? "/dashboard" : next;
}

async function parseLoginRequest(request: NextRequest): Promise<LoginRequest | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return null;
    return {
      payload: body,
      next: safeNext("next" in body ? body.next as string : request.nextUrl.searchParams.get("next")),
      wantsJson: true,
    };
  }

  const form = await request.formData().catch(() => null);
  if (!form) return null;
  return {
    payload: Object.fromEntries(form.entries()),
    next: safeNext(form.get("next") ?? request.nextUrl.searchParams.get("next")),
    wantsJson: false,
  };
}

function loginError(request: NextRequest, message: string, status: number, wantsJson: boolean) {
  if (wantsJson) return NextResponse.json({ error: message }, { status });
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  const next = request.nextUrl.searchParams.get("next");
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 303 });
}

function isTransientDatabaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const message = error instanceof Error ? error.message : String(error);
  const signal = `${code} ${message}`;

  return [
    "ECONNRESET",
    "ETIMEDOUT",
    "P1017",
    "ConnectionClosed",
    "Connection terminated unexpectedly",
    "Server has closed the connection",
    "socket disconnected",
  ].some((text) => signal.includes(text));
}

async function withTransientDatabaseRetry<T>(operation: () => Promise<T>, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientDatabaseError(error) || attempt === attempts - 1) throw error;
      await prisma.$disconnect().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!(await rateLimit(`login:${ip}`, 12)).ok) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });

  // CSRF protection
  if (!validateCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const loginRequest = await parseLoginRequest(request);
  if (!loginRequest) return NextResponse.json({ error: "Invalid login request." }, { status: 400 });

  const parsed = loginSchema.safeParse(loginRequest.payload);
  if (!parsed.success) return loginError(request, "Invalid email or password.", 400, loginRequest.wantsJson);

  const user = await withTransientDatabaseRetry(() => prisma.user.findUnique({ where: { email: parsed.data.email } }));
  if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return loginError(request, "Invalid email or password.", 401, loginRequest.wantsJson);
  }
  if (parsed.data.adminOnly && !isAdminRole(user.role)) {
    return loginError(request, "Admin access required.", 403, loginRequest.wantsJson);
  }

  const redirectTo = redirectForLoginIntent(loginRequest.next, parsed.data.adminOnly);
  const response = loginRequest.wantsJson
    ? NextResponse.json({ ok: true, redirectTo })
    : NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  setSessionCookie(response, await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role, phoneVerified: user.phoneVerified || user.role === "ADMIN", status: user.status }));
  setCsrfCookie(response);
  return response;
}

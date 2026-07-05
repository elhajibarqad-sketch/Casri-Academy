import { NextRequest, NextResponse } from "next/server";
import { readSessionFromToken } from "@/lib/auth/session";

const SESSION_COOKIE = "casri_session";

const learnerRoutes = ["/dashboard", "/learner", "/checkout"];
const learnerApis = ["/api/checkout", "/api/enrollments", "/api/profile", "/api/progress"];
const adminRoutes = ["/admin", "/api/admin"];
const browserMutationApis = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/firebase/session",
  "/api/auth/otp/request",
  "/api/auth/otp/verify",
  "/api/contact",
  "/api/newsletter",
  ...learnerApis,
  "/api/admin",
];

function startsWithAny(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function isMutation(method: string) {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

function allowedRequestOrigins(request: NextRequest) {
  const origins = new Set([request.nextUrl.origin]);
  const host = request.headers.get("host");

  if (host) {
    origins.add(`http://${host}`);
    origins.add(`https://${host}`);
  }

  return origins;
}

function isSameOriginRequest(request: NextRequest) {
  const expectedOrigins = allowedRequestOrigins(request);
  const origin = request.headers.get("origin");
  if (origin) return expectedOrigins.has(origin);

  const referer = request.headers.get("referer");
  if (!referer) return process.env.NODE_ENV !== "production";

  try {
    return expectedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

function loginRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function otpRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/verify-otp";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function forbiddenJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMutation(request.method) && startsWithAny(pathname, browserMutationApis) && !isSameOriginRequest(request)) {
    return forbiddenJson("Invalid request origin.", 403);
  }

  const session = await readSessionFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isAdminPath = startsWithAny(pathname, adminRoutes);
  const isLearnerPath = startsWithAny(pathname, learnerRoutes);
  const isLearnerApi = startsWithAny(pathname, learnerApis);

  if (isAdminPath) {
    if (!session) {
      if (pathname.startsWith("/api/")) return forbiddenJson("Authentication required.", 401);
      return loginRedirect(request, pathname);
    }
    if (!isAdminRole(session.role)) {
      if (pathname.startsWith("/api/")) return forbiddenJson("Admin access required.", 403);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.status && session.status !== "active") {
      if (pathname.startsWith("/api/")) return forbiddenJson("Account is not active.", 403);
      return loginRedirect(request, pathname);
    }
  }

  if (isLearnerPath || isLearnerApi) {
    if (!session) {
      if (pathname.startsWith("/api/")) return forbiddenJson("Authentication required.", 401);
      return loginRedirect(request, pathname);
    }
    if (session.status && session.status !== "active") {
      if (pathname.startsWith("/api/")) return forbiddenJson("Account is not active.", 403);
      return loginRedirect(request, pathname);
    }
    if (!isAdminRole(session.role) && !session.phoneVerified) {
      if (pathname.startsWith("/api/")) return forbiddenJson("Phone verification required.", 403);
      return otpRedirect(request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learner/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/firebase/session",
    "/api/auth/otp/request",
    "/api/auth/otp/verify",
    "/api/checkout",
    "/api/contact",
    "/api/enrollments",
    "/api/newsletter",
    "/api/profile",
    "/api/progress",
  ],
};

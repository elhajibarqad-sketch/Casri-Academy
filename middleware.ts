import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionFromToken } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("casri_session")?.value;
  const session = await readSessionFromToken(token);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/contact",
    "/about",
    "/courses",
    "/faq",
    "/privacy",
    "/terms",
    "/live-market",
    "/resources",
    "/roadmap",
    "/glossary",
    "/blog",
    "/support",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/firebase",
    "/api/auth/otp",
    "/api/courses",
    "/api/contact",
    "/api/market",
    "/api/newsletter",
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Dashboard routes require authentication
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/learner") || pathname.startsWith("/checkout")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes require admin role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

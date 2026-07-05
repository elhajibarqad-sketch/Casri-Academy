import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin", "/api/admin"];

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && session && session.role !== "ADMIN" && !session.phoneVerified) {
    const url = request.nextUrl.clone();
    url.pathname = "/verify-otp";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && session?.status && session.status !== "active") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && !isAdminRole(session?.role)) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};

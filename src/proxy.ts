import { NextRequest } from "next/server";
import { middleware } from "../middleware";

export function proxy(request: NextRequest) {
  return middleware(request);
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

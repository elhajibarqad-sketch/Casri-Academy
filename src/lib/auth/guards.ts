import { NextResponse } from "next/server";
import { getCurrentUser, SessionUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireVerifiedUser() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && !user.phoneVerified) throw new Error("PHONE_UNVERIFIED");
  if (user.status && user.status !== "active") throw new Error("INACTIVE_ACCOUNT");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  if (error instanceof Error && error.message === "PHONE_UNVERIFIED") {
    return NextResponse.json({ error: "Phone verification required." }, { status: 403 });
  }
  if (error instanceof Error && error.message === "INACTIVE_ACCOUNT") {
    return NextResponse.json({ error: "Account is not active." }, { status: 403 });
  }
  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

export function canAccessAdmin(user: SessionUser | null) {
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

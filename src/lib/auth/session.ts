import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "INSTRUCTOR" | "ADMIN" | "SUPER_ADMIN";
  phoneVerified?: boolean;
  status?: string;
};

const COOKIE_NAME = "casri_session";
const CSRF_COOKIE_NAME = "casri_csrf";

function secretKey() {
  return new TextEncoder().encode(env.AUTH_SECRET);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function readSessionFromToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionUser["role"],
      phoneVerified: Boolean(payload.phoneVerified),
      status: payload.status ? String(payload.status) : "active",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  return readSessionFromToken(store.get(COOKIE_NAME)?.value);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionFromRequest(request: NextRequest) {
  return readSessionFromToken(request.cookies.get(COOKIE_NAME)?.value);
}

// CSRF Protection
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function setCsrfCookie(response: NextResponse) {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return token;
}

export function getCsrfCookie(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfCookie(request);
  const headerToken = request.headers.get("x-csrf-token");
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}

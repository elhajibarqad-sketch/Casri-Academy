import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Local OTP verification is disabled. Use Firebase Phone Auth, then submit the Firebase ID token to /api/auth/firebase/session.",
    },
    { status: 410 },
  );
}

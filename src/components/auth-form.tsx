"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { Chrome, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { getFirebaseClientAuth, getGoogleProvider } from "@/lib/firebase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function continueWithGoogle() {
    setLoading(true);
    setError("");
    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/firebase/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      const next = searchParams.get("next");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

      if (response.status === 202 && data.requiresPhoneVerification) {
        window.location.assign(`/verify-otp?next=${encodeURIComponent(safeNext)}`);
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Unable to verify your Google account.");
        return;
      }
      window.location.assign(safeNext);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google sign-in was cancelled or could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
        Continue with Google
      </button>
      <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
          <span>{mode === "signup" ? "After Google verification, you will verify your phone number with an OTP before your account is activated." : "If your phone is already verified, you will go directly to your dashboard."}</span>
        </div>
      </div>
      {error && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <Link className="font-bold text-cyan-600 dark:text-cyan-300" href="/forgot-password">
          Forgot password?
        </Link>
        <span>Education-only secure access</span>
      </div>
      <div id="recaptcha-container" className="sr-only" />
    </div>
  );
}

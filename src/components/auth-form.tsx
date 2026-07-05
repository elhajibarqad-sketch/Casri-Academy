"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { Chrome, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { getFirebaseClientAuth, getGoogleProvider } from "@/lib/firebase/client";

export function AuthForm({ mode, intent = "learner" }: { mode: "login" | "signup"; intent?: "learner" | "admin" }) {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isAdminLogin = intent === "admin";

  function safeNextPath() {
    const next = searchParams.get("next");
    const fallback = isAdminLogin ? "/admin/dashboard" : "/dashboard";
    return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
  }

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
      const safeNext = safeNextPath();

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

  async function loginWithPassword(event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPasswordLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, next: safeNextPath(), adminOnly: isAdminLogin }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }
      window.location.assign(data.redirectTo ?? safeNextPath());
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      {mode === "login" && (
        <>
          <form action={`/api/auth/login?next=${encodeURIComponent(safeNextPath())}`} method="post" onSubmit={loginWithPassword} className="grid gap-4">
            <input type="hidden" name="next" value={safeNextPath()} />
            {isAdminLogin && <input type="hidden" name="adminOnly" value="true" />}
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="email">
              Email
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 dark:border-white/10 dark:focus-within:ring-cyan-300/10">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder={isAdminLogin ? "admin@casri.academy" : "you@example.com"}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none dark:text-white"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="password">
              Password
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-100 dark:border-white/10 dark:focus-within:ring-cyan-300/10">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none dark:text-white"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={loginWithPassword}
              disabled={passwordLoading}
              className="rounded-full bg-cyan-600 px-5 py-3 font-black text-white transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {passwordLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in</span> : isAdminLogin ? "Sign in to admin" : "Sign in"}
            </button>
          </form>
          {!isAdminLogin && (
            <div className="my-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>
          )}
        </>
      )}
      {!isAdminLogin && (
        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
          Continue with Google
        </button>
      )}
      <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
          <span>{isAdminLogin ? "Admin access is limited to accounts with ADMIN or SUPER_ADMIN role." : mode === "signup" ? "After Google verification, you will verify your phone number with an OTP before your account is activated." : "If your phone is already verified, you will go directly to your dashboard."}</span>
        </div>
      </div>
      {error && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <Link className="font-bold text-cyan-600 dark:text-cyan-300" href={isAdminLogin ? "/login" : "/forgot-password"}>
          {isAdminLogin ? "Learner login" : "Forgot password?"}
        </Link>
        {!isAdminLogin && <span>Education-only secure access</span>}
        {isAdminLogin && <span>Backend-only access</span>}
      </div>
      <div id="recaptcha-container" className="sr-only" />
    </div>
  );
}

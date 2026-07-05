"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Auth, ConfirmationResult, RecaptchaVerifier, linkWithPhoneNumber, onAuthStateChanged } from "firebase/auth";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

function isValidPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function OtpVerificationForm() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const auth = useMemo<Auth | null>(() => {
    try {
      return getFirebaseClientAuth();
    } catch {
      return null;
    }
  }, []);
  const configError = auth ? "" : "Firebase configuration is missing. Add Firebase environment variables before phone verification.";

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      setReady(Boolean(user));
      if (!user) setError("Please continue with Google before verifying your phone number.");
    });
  }, [auth]);

  async function ensureRecaptcha() {
    if (!auth) throw new Error("Firebase is not configured.");
    if (recaptchaRef.current) return recaptchaRef.current;
    recaptchaRef.current = new RecaptchaVerifier(auth, "otp-recaptcha-container", {
      size: "invisible",
    });
    await recaptchaRef.current.render();
    return recaptchaRef.current;
  }

  async function sendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!isValidPhone(phoneNumber)) {
      setError("Use international phone format, for example +252612345678.");
      return;
    }
    if (!auth?.currentUser) {
      setError("Google sign-in is required before phone verification.");
      return;
    }
    setSending(true);
    try {
      const rateLimitResponse = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const rateLimitData = await rateLimitResponse.json();
      if (!rateLimitResponse.ok) throw new Error(rateLimitData.error ?? "Unable to send OTP.");

      const verifier = await ensureRecaptcha();
      const result = await linkWithPhoneNumber(auth.currentUser, phoneNumber, verifier);
      setConfirmation(result);
      setStatus("OTP sent. Check your phone and enter the code.");
    } catch (sendError) {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setError(sendError instanceof Error ? sendError.message : "OTP could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!confirmation) {
      setError("Send an OTP before verifying.");
      return;
    }
    setVerifying(true);
    try {
      const credential = await confirmation.confirm(otp);
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/firebase/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Phone verification succeeded, but the app session could not be created.");
      const next = searchParams.get("next");
      const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      window.location.assign(target);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Invalid OTP code.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3 rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 dark:bg-cyan-300/10 dark:text-cyan-100">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
        <p>Your account activates only after Google and phone OTP verification are both complete.</p>
      </div>
      <form onSubmit={sendOtp} className="mt-5 grid gap-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="phoneNumber">
          Phone number
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10">
          <Phone className="h-5 w-5 text-slate-400" />
          <input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+252612345678"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
          />
        </div>
        <button disabled={!ready || sending} className="rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950">
          {sending ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP</span> : "Send OTP"}
        </button>
      </form>

      <form onSubmit={verifyOtp} className="mt-5 grid gap-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="otp">
          OTP code
        </label>
        <input
          id="otp"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="Enter verification code"
          className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none dark:border-white/10"
        />
        <button disabled={!confirmation || verifying} className="rounded-full bg-cyan-600 px-5 py-3 font-black text-white transition hover:bg-cyan-700 disabled:opacity-60">
          {verifying ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying</span> : "Verify and activate account"}
        </button>
      </form>
      {status && <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{status}</div>}
      {(configError || error) && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{configError || error}</div>}
      <div id="otp-recaptcha-container" />
    </div>
  );
}

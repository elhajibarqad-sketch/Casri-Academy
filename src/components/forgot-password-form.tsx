"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), email);
      setMessage("If this email is registered for password login, a reset link has been sent.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Password reset could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email address" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
      <button disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-cyan-600 disabled:opacity-60 dark:bg-white dark:text-slate-950">
        {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending</span> : "Send reset link"}
      </button>
      {message && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{message}</div>}
      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}
    </form>
  );
}

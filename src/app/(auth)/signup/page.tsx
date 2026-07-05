import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Logo />
        <h1 className="mt-10 text-4xl font-black text-slate-950 dark:text-white">Create your Casri account.</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Secure access to paid courses, progress, payments, and certificates.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5">Loading form...</div>}>
            <AuthForm mode="signup" />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-slate-500">Already registered? <Link className="font-bold text-cyan-600" href="/login">Login</Link></p>
      </div>
    </main>
  );
}

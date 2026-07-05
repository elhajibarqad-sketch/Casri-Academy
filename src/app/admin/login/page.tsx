import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <div className="w-full max-w-md">
        <Logo />
        <p className="mt-10 text-sm font-bold uppercase text-cyan-300">Admin Backend</p>
        <h1 className="mt-3 text-4xl font-black">Staff sign in.</h1>
        <p className="mt-3 text-slate-300">Use an admin account to manage courses, learners, orders, payments, enrollments, and site content.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Loading admin form...</div>}>
            <AuthForm mode="login" intent="admin" />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Student access? <Link className="font-bold text-cyan-300" href="/login">Go to learner login</Link>
        </p>
      </div>
    </main>
  );
}

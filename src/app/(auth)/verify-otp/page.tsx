import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { OtpVerificationForm } from "@/components/otp-verification-form";

export const metadata = {
  title: "Verify Phone | Casri Academy",
  description: "Verify your phone number with OTP to activate your Casri Academy account.",
};

export default function VerifyOtpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Logo />
        <h1 className="mt-10 text-4xl font-black text-slate-950 dark:text-white">Verify your phone.</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Enter your phone number, confirm the OTP, and unlock your protected dashboard.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5">Loading verification...</div>}>
            <OtpVerificationForm />
          </Suspense>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          Need to switch accounts? <Link className="font-bold text-cyan-600" href="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}

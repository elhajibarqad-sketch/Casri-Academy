import Link from "next/link";
import { Logo } from "@/components/logo";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Casri Academy",
  description: "Reset password access for Casri Academy accounts.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Logo />
        <h1 className="mt-10 text-4xl font-black text-slate-950 dark:text-white">Reset access.</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Google sign-in is recommended. This page supports Firebase password reset if email/password is enabled in your Firebase project.</p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <p className="mt-5 text-sm text-slate-500">
          Remembered it? <Link className="font-bold text-cyan-600" href="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";

export default function ConfirmationPage() {
  return (
    <DashboardShell>
      <div className="max-w-2xl rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-300/20 dark:bg-emerald-300/10">
        <h1 className="text-4xl font-black text-emerald-900 dark:text-emerald-100">Order received.</h1>
        <p className="mt-4 text-emerald-800 dark:text-emerald-200">Payment confirmation is handled by the secure Stripe webhook before enrollment is unlocked.</p>
      </div>
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "PAID") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-100";
  if (status === "FAILED" || status === "REFUNDED") return "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-100";
  return "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
}

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const [payments, paidRevenue, paidCount, pendingCount, failedCount] = await Promise.all([
    prisma.payment.findMany({
      include: {
        user: { select: { email: true, name: true } },
        order: { include: { course: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
  ]);
  const stats = [
    ["Paid revenue", money(paidRevenue._sum.amountCents ?? 0)],
    ["Paid payments", paidCount.toLocaleString()],
    ["Pending", pendingCount.toLocaleString()],
    ["Failed", failedCount.toLocaleString()],
  ];

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Payments</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Track provider payments, manual confirmations, learner ownership, and linked orders.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
              <tr>
                {["Payment", "Learner", "Course", "Provider", "Amount", "Status"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {payments.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={6}>No payments yet.</td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{payment.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.user.name}<br />{payment.user.email}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.order?.course.title ?? "No linked order"}</td>
                  <td className="px-5 py-4 text-slate-500">{payment.provider}</td>
                  <td className="px-5 py-4 text-slate-500">{money(payment.amountCents, payment.currency)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(payment.status)}`}>{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

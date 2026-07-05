import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const [orders, pendingEnrollments, paidRevenue, pendingCount, refundCount] = await Promise.all([
    prisma.order.findMany({
      include: {
        course: { select: { title: true } },
        user: { select: { email: true } },
        payment: { select: { providerPaymentId: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { enrollmentStatus: "PENDING" },
      include: { course: { select: { title: true, priceCents: true, currency: true } }, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "REFUNDED" } }),
  ]);
  const stats = [
    ["Paid revenue", `$${Math.round((paidRevenue._sum.amountCents ?? 0) / 100).toLocaleString()}`],
    ["Pending", pendingCount.toLocaleString()],
    ["Refunds", refundCount.toLocaleString()],
  ];

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Orders & payments</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
              <tr>
                {["Order", "Course", "Customer", "Amount", "Payment"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {orders.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={5}>No orders yet.</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-slate-500">{order.course.title}</td>
                  <td className="px-5 py-4 text-slate-500">{order.user.email}</td>
                  <td className="px-5 py-4 text-slate-500">${Math.round(order.totalCents / 100)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-slate-100 p-5 dark:border-white/10">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Pending enrollment approvals</h2>
          <p className="mt-1 text-sm text-slate-500">Approve paid/manual enrollments only after payment is confirmed.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
              <tr>
                {["Learner", "Course", "Amount", "Status", "Action"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {pendingEnrollments.length === 0 ? (
                <tr><td className="px-5 py-6 text-slate-500" colSpan={5}>No pending enrollments.</td></tr>
              ) : pendingEnrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-5 py-4 text-slate-500">{enrollment.user.name}<br />{enrollment.user.email}</td>
                  <td className="px-5 py-4 text-slate-500">{enrollment.course.title}</td>
                  <td className="px-5 py-4 text-slate-500">${Math.round(enrollment.course.priceCents / 100)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">{enrollment.enrollmentStatus}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <form action={`/api/admin/enrollments/${enrollment.id}`} method="post">
                        <input type="hidden" name="_method" value="PATCH" />
                        <input type="hidden" name="action" value="approve" />
                        <button formMethod="post" className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">Approve</button>
                      </form>
                      <form action={`/api/admin/enrollments/${enrollment.id}`} method="post">
                        <input type="hidden" name="_method" value="PATCH" />
                        <input type="hidden" name="action" value="reject" />
                        <button formMethod="post" className="rounded-full bg-rose-600 px-3 py-2 text-xs font-black text-white">Reject</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

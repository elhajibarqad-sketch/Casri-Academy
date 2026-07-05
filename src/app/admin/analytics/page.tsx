import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const [paidRevenue, activeEnrollments, completedEnrollments, pendingOrders, publishedCourses, draftCourses, verifiedLearners, totalLearners] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.enrollment.count({ where: { enrollmentStatus: "ACTIVE" } }),
    prisma.enrollment.count({ where: { enrollmentStatus: "COMPLETED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count({ where: { status: "DRAFT" } }),
    prisma.user.count({ where: { googleVerified: true, phoneVerified: true } }),
    prisma.user.count(),
  ]);
  const cards = [
    ["Paid revenue", `$${Math.round((paidRevenue._sum.amountCents ?? 0) / 100).toLocaleString()}`],
    ["Active enrollments", activeEnrollments.toLocaleString()],
    ["Completed enrollments", completedEnrollments.toLocaleString()],
    ["Pending orders", pendingOrders.toLocaleString()],
    ["Published courses", publishedCourses.toLocaleString()],
    ["Draft courses", draftCourses.toLocaleString()],
    ["Verified learners", verifiedLearners.toLocaleString()],
    ["Total users", totalLearners.toLocaleString()],
  ];

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Analytics</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

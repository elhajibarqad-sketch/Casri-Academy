import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [revenue, orders, users, courses, enrollments, pendingEnrollments, supportMessages, certificates] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { enrollmentStatus: "PENDING" } }),
    prisma.contactMessage.count(),
    prisma.certificate.count(),
  ]);
  const stats = [
    ["Revenue", `$${Math.round((revenue._sum.amountCents ?? 0) / 100).toLocaleString()}`, "/admin/orders"],
    ["Orders", orders.toLocaleString(), "/admin/orders"],
    ["Learners", users.toLocaleString(), "/admin/users"],
    ["Courses", courses.toLocaleString(), "/admin/courses"],
    ["Enrollments", enrollments.toLocaleString(), "/admin/enrollments"],
    ["Pending approvals", pendingEnrollments.toLocaleString(), "/admin/enrollments"],
    ["Support messages", supportMessages.toLocaleString(), "/admin/support"],
    ["Certificates", certificates.toLocaleString(), "/admin/certificates"],
  ];

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin Panel</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Casri Academy operations</h1>
      <p className="mt-3 max-w-3xl text-slate-500 dark:text-slate-400">Separate backend-controlled admin workspace for courses, learners, enrollments, payments, certificates, content, notifications, support, and analytics.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-cyan-300 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{value}</div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}

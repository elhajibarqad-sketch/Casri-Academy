import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  await requireAdmin();
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { name: true, email: true, phoneVerified: true, googleVerified: true } },
      course: { select: { title: true, priceCents: true, currency: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Enrollment management</h1>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
              <tr>{["Learner", "Course", "Payment", "Enrollment", "Progress", "Verification", "Actions"].map((head) => <th key={head} className="px-5 py-4 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {enrollments.length === 0 ? (
                <tr><td className="px-5 py-6 text-slate-500" colSpan={7}>No enrollments yet.</td></tr>
              ) : enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-5 py-4 text-slate-500"><span className="font-semibold text-slate-900 dark:text-white">{enrollment.user.name}</span><br />{enrollment.user.email}</td>
                  <td className="px-5 py-4 text-slate-500">{enrollment.course.title}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">{enrollment.paymentStatus}</span></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">{enrollment.enrollmentStatus}</span></td>
                  <td className="px-5 py-4 text-slate-500">{enrollment.completionPercent}%</td>
                  <td className="px-5 py-4 text-slate-500">Google: {enrollment.user.googleVerified ? "yes" : "no"}<br />Phone: {enrollment.user.phoneVerified ? "yes" : "no"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <form action={`/api/admin/enrollments/${enrollment.id}`} method="post">
                        <input type="hidden" name="action" value="approve" />
                        <button className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">Approve</button>
                      </form>
                      <form action={`/api/admin/enrollments/${enrollment.id}`} method="post">
                        <input type="hidden" name="action" value="reject" />
                        <button className="rounded-full bg-rose-600 px-3 py-2 text-xs font-black text-white">Reject</button>
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

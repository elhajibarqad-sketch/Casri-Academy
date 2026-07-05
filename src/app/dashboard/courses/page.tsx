import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireVerifiedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { money, readableEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "ACTIVE" || status === "PAID" || status === "COMPLETED") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-100";
  return "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
}

export default async function MyCoursesPage() {
  const user = await requireVerifiedUser();
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { include: { lessons: { select: { id: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white">My courses</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Track active, pending, completed, and cancelled enrollments.</p>
        </div>
        <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Browse Courses</Link>
      </div>
      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((enrollment) => (
            <article key={enrollment.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-black uppercase text-cyan-500">{readableEnum(enrollment.course.level)}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(enrollment.enrollmentStatus)}`}>{enrollment.enrollmentStatus}</span>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{enrollment.course.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{enrollment.course.subtitle}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-500">
                <div>{readableEnum(enrollment.course.category)} - {enrollment.course.duration}</div>
                <div>{enrollment.course.lessons.length} lessons - {money(enrollment.course.priceCents, enrollment.course.currency)}</div>
                <div>Payment: <span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass(enrollment.paymentStatus)}`}>{enrollment.paymentStatus}</span></div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${enrollment.completionPercent}%` }} />
              </div>
              {(enrollment.enrollmentStatus === "ACTIVE" || enrollment.enrollmentStatus === "COMPLETED") ? (
                <Link href={`/my-courses/${enrollment.course.id}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">Open course</Link>
              ) : (
                <div className="mt-5 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">Access unlocks after payment or staff approval.</div>
              )}
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

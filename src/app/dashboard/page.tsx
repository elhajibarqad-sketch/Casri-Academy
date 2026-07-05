import Image from "next/image";
import Link from "next/link";
import { Bell, BookOpen, CheckCircle2, Clock, CreditCard, FileBadge, Settings, Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProgressChart } from "@/components/progress-chart";
import { requireVerifiedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { money, readableEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "ACTIVE" || status === "PAID" || status === "COMPLETED") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200";
  if (status === "PENDING") return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-100";
  return "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
}

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ enrollment?: string }> }) {
  const user = await requireVerifiedUser();
  const params = await searchParams;
  const [dbUser, enrollments, orders, certificates, availableCourses] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { include: { lessons: { select: { id: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({ where: { userId: user.id }, include: { course: true, payment: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.certificate.findMany({ where: { userId: user.id }, orderBy: { issuedAt: "desc" }, take: 6 }),
    prisma.course.findMany({ where: { status: "PUBLISHED" }, include: { lessons: { select: { id: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const enrollmentByCourse = new Map(enrollments.map((enrollment) => [enrollment.courseId, enrollment]));
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.enrollmentStatus === "ACTIVE" || enrollment.enrollmentStatus === "COMPLETED");
  const pendingEnrollments = enrollments.filter((enrollment) => enrollment.enrollmentStatus === "PENDING");
  const averageProgress = enrollments.length ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.completionPercent, 0) / enrollments.length) : 0;
  const completedLessons = enrollments.reduce((sum, enrollment) => sum + Math.round((enrollment.completionPercent / 100) * enrollment.course.lessons.length), 0);
  const totalLessons = enrollments.reduce((sum, enrollment) => sum + enrollment.course.lessons.length, 0);
  const progressData = enrollments.map((enrollment, index) => ({ label: `C${index + 1}`, progress: enrollment.completionPercent }));
  const firstActive = activeEnrollments[0];

  return (
    <DashboardShell>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl bg-slate-100 dark:bg-white/10">
            {dbUser?.photoURL ? <Image src={dbUser.photoURL} alt="" fill sizes="80px" className="object-cover" /> : <div className="grid h-full place-items-center text-2xl font-black text-cyan-600">{user.name.slice(0, 1).toUpperCase()}</div>}
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-cyan-500">Learner Dashboard</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Welcome back, {user.name}.</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.email} - Phone verified learner account</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/courses" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">Browse Courses</Link>
            <Link href="/dashboard/profile" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200">Profile Settings</Link>
          </div>
        </div>
        <div className="mt-6 h-3 rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${averageProgress}%` }} />
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{averageProgress}% average learning progress</div>
      </div>

      {params?.enrollment && (
        <div className="mt-5 rounded-[1.5rem] border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
          Enrollment status updated: {params.enrollment.replace("-", " ")}.
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {[
          ["Active courses", activeEnrollments.length.toLocaleString(), BookOpen],
          ["Pending enrollments", pendingEnrollments.length.toLocaleString(), Clock],
          ["Completed lessons", `${completedLessons}/${totalLessons}`, CheckCircle2],
          ["Certificates", certificates.length.toLocaleString(), FileBadge],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <Icon className="h-5 w-5 text-cyan-500" />
            <div className="mt-4 text-sm text-slate-500">{label as string}</div>
            <div className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value as string}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">My Courses</h2>
            {firstActive?.course.lessons[0] ? <Link href={`/dashboard/player/${firstActive.course.lessons[0].id}`} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-black text-white">Continue Learning</Link> : null}
          </div>
          <div className="mt-5 grid gap-4">
            {enrollments.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">No enrolled courses yet. Browse available courses below to start.</div>
            ) : enrollments.map((enrollment) => {
              const courseCompletedLessons = Math.round((enrollment.completionPercent / 100) * enrollment.course.lessons.length);
              const courseRemainingLessons = Math.max(0, enrollment.course.lessons.length - courseCompletedLessons);

              return (
                <div key={enrollment.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-950 dark:text-white">{enrollment.course.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{courseCompletedLessons} completed lessons - {courseRemainingLessons} remaining lessons</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(enrollment.enrollmentStatus)}`}>{enrollment.enrollmentStatus}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${enrollment.completionPercent}%` }} />
                  </div>
                  {(enrollment.enrollmentStatus === "ACTIVE" || enrollment.enrollmentStatus === "COMPLETED") && enrollment.course.lessons[0] && (
                    <Link href={`/dashboard/player/${enrollment.course.lessons[0].id}`} className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Continue learning</Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Course progress</h2>
          <ProgressChart data={progressData} />
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">Browse Available Courses</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {availableCourses.map((course) => {
            const existing = enrollmentByCourse.get(course.id);
            return (
              <article key={course.id} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <div className="text-xs font-black uppercase text-cyan-500">{readableEnum(course.level)} - {readableEnum(course.category)}</div>
                <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{course.subtitle}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-500">
                  <div>Instructor: {course.instructor}</div>
                  <div>{course.duration} - {course.lessons.length} lessons</div>
                  <div className="font-black text-slate-950 dark:text-white">{money(course.priceCents, course.currency)}</div>
                </div>
                {existing ? (
                  <div className={`mt-5 rounded-full px-4 py-2 text-center text-sm font-black ${statusClass(existing.enrollmentStatus)}`}>{existing.enrollmentStatus}</div>
                ) : (
                  <form action="/api/enrollments" method="post" className="mt-5">
                    <input type="hidden" name="courseId" value={course.id} />
                    <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
                      {course.priceCents === 0 ? "Enroll Free" : "Enroll Now"}
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><FileBadge className="h-5 w-5 text-cyan-500" /> Certificates</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-500 dark:text-slate-400">
            {certificates.length === 0 ? "No certificates issued yet." : certificates.map((certificate) => <div key={certificate.id}>{certificate.certificateNo}</div>)}
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><CreditCard className="h-5 w-5 text-cyan-500" /> Payment history</h2>
          <div className="mt-4 grid gap-3">
            {orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{order.course.title}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass(order.status)}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Bell className="h-5 w-5 text-cyan-500" /> Notifications</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div>Phone verification complete.</div>
            {pendingEnrollments.length > 0 && <div>{pendingEnrollments.length} enrollment awaiting payment or staff approval.</div>}
            {activeEnrollments.length === 0 && <div>Browse courses to start your first learning track.</div>}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Star className="h-5 w-5 text-cyan-500" /> Saved courses</h2>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Saved courses are ready for the next release. Use Browse Courses to enroll now.</p>
        </section>
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><Settings className="h-5 w-5 text-cyan-500" /> Profile settings</h2>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Update your phone, timezone, bio, and account details from profile settings.</p>
          <Link href="/dashboard/profile" className="mt-5 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-200">Open profile settings</Link>
        </section>
      </div>
    </DashboardShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function LearnerCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireVerifiedUser();
  const { id } = await params;
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      status: "PUBLISHED",
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  const hasAccess = enrollment?.enrollmentStatus === "ACTIVE" || enrollment?.enrollmentStatus === "COMPLETED";
  const completedLessons = Math.round(((enrollment?.completionPercent ?? 0) / 100) * course.lessons.length);
  const remainingLessons = Math.max(0, course.lessons.length - completedLessons);

  return (
    <DashboardShell>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-cyan-500">My Course</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{course.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-500 dark:text-slate-400">{course.subtitle}</p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-black ${statusClass(enrollment?.enrollmentStatus ?? "NOT_ENROLLED")}`}>
            {enrollment?.enrollmentStatus ?? "NOT ENROLLED"}
          </span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
            <div className="text-xs font-bold uppercase text-slate-500">Progress</div>
            <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{enrollment?.completionPercent ?? 0}%</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
            <div className="text-xs font-bold uppercase text-slate-500">Lessons</div>
            <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{completedLessons}/{course.lessons.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
            <div className="text-xs font-bold uppercase text-slate-500">Remaining</div>
            <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{remainingLessons}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
            <div className="text-xs font-bold uppercase text-slate-500">Payment</div>
            <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{enrollment?.paymentStatus ?? money(course.priceCents, course.currency)}</div>
          </div>
        </div>
        {!enrollment && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            You are not enrolled in this course yet. Enroll before protected lessons unlock.
          </div>
        )}
        {enrollment && !hasAccess && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            This course is locked until payment is confirmed or staff approves your enrollment.
          </div>
        )}
      </div>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Lessons</h2>
            <p className="mt-1 text-sm text-slate-500">{readableEnum(course.level)} - {readableEnum(course.category)} - {course.duration}</p>
          </div>
          {!enrollment && <Link href={`/dashboard/checkout/${course.id}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Enroll now</Link>}
        </div>
        <div className="mt-5 grid gap-3">
          {course.lessons.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">No lessons have been published for this course yet.</div>
          ) : course.lessons.map((lesson) => {
            const unlocked = hasAccess || lesson.isFree;
            return (
              <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <div>
                  <div className="text-sm font-black text-slate-950 dark:text-white">{lesson.order}. {lesson.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{lesson.isFree ? "Free preview" : unlocked ? "Unlocked" : "Locked"} - {lesson.durationMin} min</div>
                </div>
                {unlocked ? (
                  <Link href={`/dashboard/player/${lesson.id}`} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-black text-white">Open lesson</Link>
                ) : (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}

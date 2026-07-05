import { DashboardShell } from "@/components/dashboard-shell";
import { requireVerifiedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePlayerPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const user = await requireVerifiedUser();
  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson) {
    return (
      <DashboardShell>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5">
          Lesson not found.
        </div>
      </DashboardShell>
    );
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.courseId } },
  });
  const allowed = lesson.isFree || enrollment?.enrollmentStatus === "ACTIVE" || enrollment?.enrollmentStatus === "COMPLETED";

  return (
    <DashboardShell>
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">{lesson.title}</h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">{lesson.course.title}</p>
      {!allowed ? (
        <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          Your enrollment must be active before this protected lesson unlocks.
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] bg-slate-950 p-4 shadow-2xl">
          <div className="grid aspect-video place-items-center rounded-[1.5rem] bg-[radial-gradient(circle,rgba(34,211,238,0.24),transparent_45%),linear-gradient(135deg,#020617,#0f172a)] text-white">
            <div className="max-w-xl text-center">
              <div className="text-sm font-bold uppercase text-cyan-200">{lesson.isFree ? "Free lesson" : "Protected lesson"}</div>
              <div className="mt-3 text-3xl font-black">{lesson.title}</div>
              <p className="mt-3 text-slate-300">{lesson.summary}</p>
              {lesson.videoUrl && <a className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950" href={lesson.videoUrl}>Open video</a>}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

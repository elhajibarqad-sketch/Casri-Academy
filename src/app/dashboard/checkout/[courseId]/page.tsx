import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireVerifiedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await requireVerifiedUser();
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { select: { id: true } } },
  });
  if (!course || course.status !== "PUBLISHED") notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  return (
    <DashboardShell>
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Secure checkout</h1>
      <form action="/api/checkout" method="post" className="mt-8 max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
        <input type="hidden" name="courseId" value={course.id} />
        <div className="text-sm font-bold uppercase text-cyan-500">Order summary</div>
        <div className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{course.title}</div>
        <div className="mt-2 text-slate-500">{course.duration} - {course.lessons.length} lessons</div>
        {enrollment && (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            Enrollment status: {enrollment.enrollmentStatus}. Payment status: {enrollment.paymentStatus}.
          </div>
        )}
        <div className="mt-8 text-4xl font-black text-slate-950 dark:text-white">{money(course.priceCents, course.currency)}</div>
        <button className="mt-8 w-full rounded-full bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">
          Continue to payment
        </button>
      </form>
    </DashboardShell>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireVerifiedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { money, readableEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutIndexPage({ searchParams }: { searchParams?: Promise<{ courseId?: string; course?: string }> }) {
  await requireVerifiedUser();
  const params = await searchParams;
  const requestedCourse = params?.courseId ?? params?.course;

  if (requestedCourse) {
    redirect(`/dashboard/checkout/${requestedCourse}`);
  }

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { lessons: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell>
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Choose a course to checkout</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Free courses unlock instantly. Paid courses unlock after payment or staff approval.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            No published courses are available yet.
          </div>
        ) : courses.map((course) => (
          <article key={course.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <div className="text-xs font-black uppercase text-cyan-500">{readableEnum(course.level)} - {readableEnum(course.category)}</div>
            <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{course.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{course.subtitle}</p>
            <div className="mt-4 text-sm text-slate-500">{course.duration} - {course.lessons.length} lessons</div>
            <div className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{money(course.priceCents, course.currency)}</div>
            <Link href={`/dashboard/checkout/${course.id}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
              Continue checkout
            </Link>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}

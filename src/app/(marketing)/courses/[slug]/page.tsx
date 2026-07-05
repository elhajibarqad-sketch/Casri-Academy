import { notFound } from "next/navigation";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { money, readableEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: "asc" } }, previews: true },
  });
  if (!course || course.status !== "PUBLISHED") notFound();

  return (
    <PageFrame>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="text-sm font-bold uppercase text-cyan-500">{readableEnum(course.category)}</div>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 dark:text-white">{course.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{course.subtitle}</p>
          <p className="mt-5 max-w-3xl leading-7 text-slate-500 dark:text-slate-400">{course.description}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Preview lessons", "Paid course access", "Certificate on completion"].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <CheckCircle2 className="text-emerald-500" />
                <div className="mt-3 font-bold text-slate-900 dark:text-white">{item}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <PlayCircle size={42} className="text-cyan-300" />
            <div className="mt-8 text-4xl font-black">{money(course.priceCents, course.currency)}</div>
            <div className="mt-2 text-sm text-slate-300">{course.duration} · {course.lessons.length} lessons · {readableEnum(course.level)}</div>
          </div>
          <div className="mt-5 grid gap-3">
            <ButtonLink href={`/courses/${course.slug}/preview`}>Preview free lessons</ButtonLink>
            <ButtonLink href={`/dashboard/checkout/${course.id}`} variant="secondary">Buy course</ButtonLink>
          </div>
        </aside>
      </section>
    </PageFrame>
  );
}

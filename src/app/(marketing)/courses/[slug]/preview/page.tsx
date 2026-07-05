import { notFound } from "next/navigation";
import { PageFrame } from "@/components/page-frame";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { where: { isFree: true }, orderBy: { order: "asc" } }, previews: true },
  });
  if (!course || course.status !== "PUBLISHED") notFound();
  const preview = course.previews[0];
  const freeLesson = course.lessons[0];

  return (
    <PageFrame>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="rounded-[2rem] bg-slate-950 p-4 shadow-2xl">
          <div className="grid aspect-video place-items-center rounded-[1.5rem] bg-[radial-gradient(circle,rgba(34,211,238,0.28),transparent_45%),linear-gradient(135deg,#020617,#0f172a)] text-center text-white">
            <div>
              <div className="text-sm font-bold uppercase text-cyan-200">Free preview</div>
              <h1 className="mt-3 text-4xl font-black">{preview?.title ?? freeLesson?.title ?? course.title}</h1>
              <p className="mt-3 text-slate-300">
                {preview?.content ?? freeLesson?.summary ?? "No free preview lesson has been published for this course yet."}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <ButtonLink href={`/courses/${course.slug}`}>Back to course</ButtonLink>
          <ButtonLink href={`/dashboard/checkout/${course.id}`} variant="secondary">Enroll securely</ButtonLink>
        </div>
      </section>
    </PageFrame>
  );
}

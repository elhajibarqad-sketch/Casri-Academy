import { CourseCard } from "@/components/marketing/course-card";
import { PageFrame, PageHero } from "@/components/page-frame";
import { categories } from "@/content/catalog";
import { prisma } from "@/lib/prisma";
import { readableEnum } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { lessons: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageFrame>
      <PageHero eyebrow="Courses" title="Choose a learning track and build skill step by step." body="Preview free lessons, enroll securely, track completion, and unlock certificates after finishing a course." />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {category}
            </span>
          ))}
        </div>
        {courses.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            No published courses yet. New learning tracks are being prepared.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  slug: course.slug,
                  title: course.title,
                  subtitle: course.subtitle,
                  category: readableEnum(course.category),
                  level: readableEnum(course.level),
                  priceCents: course.priceCents,
                  duration: course.duration,
                  lessons: course.lessons.length,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}

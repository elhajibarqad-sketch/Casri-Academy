import { BarChart3, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer";
import { MotionShell } from "@/components/motion-shell";
import { CourseCard } from "@/components/marketing/course-card";
import { HomeHeroSlider } from "@/components/marketing/home-hero-slider";
import { MarketStrip } from "@/components/marketing/market-strip";
import { SiteNav } from "@/components/nav";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { readableEnum } from "@/lib/utils";

const features = [
  ["Secure learning", "Protected course player, paid access checks, certificates, and saved progress.", LockKeyhole],
  ["Live market context", "BTC, ETH, SOL and major FX rates are pulled from real public APIs.", BarChart3],
  ["Admin operations", "Course, user, order, payment, lesson, media, and audit log foundation.", ShieldCheck],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [courses, courseCount, lessonCount] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { lessons: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.lesson.count(),
  ]);
  const stats = [
    [courseCount.toLocaleString(), "published tracks"],
    [lessonCount.toLocaleString(), "lessons"],
    ["24/7", "market context"],
  ];

  return (
    <>
      <SiteNav />
      <MotionShell>
        <main>
          <HomeHeroSlider stats={stats} />

          <section className="mx-auto max-w-7xl px-5 py-12">
            <MarketStrip />
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-cyan-500">
                  <GraduationCap size={17} /> Featured tracks
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Courses built like a real curriculum.</h2>
              </div>
              <ButtonLink href="/courses" variant="secondary">All courses</ButtonLink>
            </div>
            {courses.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                No published courses yet. Admin can publish the first course from the course management panel.
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

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="grid gap-5 md:grid-cols-3">
              {features.map(([title, body, Icon]) => (
                <div key={title as string} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/5">
                  <Icon className="text-cyan-500" size={28} />
                  <h3 className="mt-6 text-xl font-black text-slate-950 dark:text-white">{title as string}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{body as string}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </MotionShell>
      <Footer />
    </>
  );
}

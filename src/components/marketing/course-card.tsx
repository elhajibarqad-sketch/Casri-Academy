import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { money } from "@/lib/utils";

type CourseCardProps = {
  course: {
    slug: string;
    title: string;
    subtitle: string;
    category: string;
    level: string;
    priceCents: number;
    duration: string;
    progress?: number;
    lessons: number;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
      <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-900 p-5 text-white">
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-cyan-100/80">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>
        <h3 className="mt-10 text-2xl font-black tracking-tight">{course.title}</h3>
      </div>
      <p className="mt-5 min-h-16 text-sm leading-6 text-slate-500 dark:text-slate-400">{course.subtitle}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${course.progress ?? 0}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2"><Clock size={16} /> {course.duration}</span>
        <span className="flex items-center gap-2"><BookOpen size={16} /> {course.lessons} lessons</span>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-2xl font-black text-slate-950 dark:text-white">{money(course.priceCents)}</div>
        <ButtonLink href={`/courses/${course.slug}`} className="gap-2">
          View <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </article>
  );
}

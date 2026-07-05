import { Footer } from "./footer";
import { MotionShell } from "./motion-shell";
import { SiteNav } from "./nav";

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <MotionShell>{children}</MotionShell>
      <Footer />
    </>
  );
}

export function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-5">
        <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
          {eyebrow}
        </div>
        <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </section>
  );
}

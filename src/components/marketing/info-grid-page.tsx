import { PageFrame, PageHero } from "@/components/page-frame";

export function InfoGridPage({
  eyebrow,
  title,
  body,
  items,
}: {
  eyebrow: string;
  title: string;
  body: string;
  items: Array<{ title: string; body: string; meta?: string }>;
}) {
  return (
    <PageFrame>
      <PageHero eyebrow={eyebrow} title={title} body={body} />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              {item.meta && <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-500">{item.meta}</div>}
              <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

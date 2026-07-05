import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const inputClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white";

export default async function AdminContentPage() {
  await requireAdmin();
  const [slides, settings] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.siteSetting.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Website content</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
        <form action="/api/admin/hero-slides" method="post" className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Add hero slide</h2>
          <input name="title" required placeholder="Slide title" className={inputClass} />
          <input name="subtitle" placeholder="Subtitle" className={inputClass} />
          <input name="imageUrl" required placeholder="Image URL" className={inputClass} />
          <input name="order" type="number" placeholder="Order" className={inputClass} />
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Save slide</button>
        </form>
        <div className="grid gap-4">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Hero slider images</h2>
            <div className="mt-4 grid gap-3">
              {slides.length === 0 ? <p className="text-sm text-slate-500">No managed slides yet. The homepage uses default premium slides until managed slides are connected.</p> : slides.map((slide) => (
                <div key={slide.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <div className="font-black text-slate-950 dark:text-white">{slide.title}</div>
                  <div className="mt-1 text-sm text-slate-500">Order {slide.order} - {slide.active ? "Active" : "Inactive"}</div>
                  <div className="mt-2 truncate text-xs text-slate-400">{slide.imageUrl}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Site settings</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              {settings.length === 0 ? "No site settings stored yet." : settings.map((setting) => <div key={setting.id}>{setting.key}</div>)}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

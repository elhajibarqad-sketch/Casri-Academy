import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const inputClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white";

export default async function AdminInstructorsPage() {
  await requireAdmin();
  const instructors = await prisma.instructor.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Instructors</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[380px_1fr]">
        <form action="/api/admin/instructors" method="post" className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Add instructor</h2>
          <input name="name" required placeholder="Full name" className={inputClass} />
          <input name="email" required type="email" placeholder="Email" className={inputClass} />
          <input name="specialty" required placeholder="Specialty" className={inputClass} />
          <input name="avatarUrl" placeholder="Avatar URL" className={inputClass} />
          <textarea name="bio" placeholder="Bio" rows={4} className={inputClass} />
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Save instructor</button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {instructors.length === 0 ? <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.05]">No instructors yet.</div> : instructors.map((instructor) => (
            <article key={instructor.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs font-black uppercase text-cyan-500">{instructor.specialty}</div>
              <h2 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{instructor.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{instructor.email}</p>
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{instructor.bio ?? "No bio provided."}</p>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

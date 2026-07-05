import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const inputClass = "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white";

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const notifications = await prisma.notification.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Notifications</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[380px_1fr]">
        <form action="/api/admin/notifications" method="post" className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Create notification</h2>
          <input name="title" required placeholder="Title" className={inputClass} />
          <input name="audience" placeholder="Audience: all, learners, admins" className={inputClass} />
          <textarea name="body" required placeholder="Message" rows={5} className={inputClass} />
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Send notification</button>
        </form>
        <div className="grid gap-3">
          {notifications.length === 0 ? <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.05]">No notifications yet.</div> : notifications.map((notification) => (
            <article key={notification.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs font-black uppercase text-cyan-500">{notification.audience}</div>
              <h2 className="mt-2 text-lg font-black text-slate-950 dark:text-white">{notification.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{notification.body}</p>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

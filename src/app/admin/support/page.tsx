import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requireAdmin();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Support messages</h1>
      <div className="mt-8 grid gap-4">
        {messages.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.05]">No support messages yet.</div>
        ) : messages.map((message) => (
          <article key={message.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-cyan-500">{message.topic}</div>
                <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{message.name}</h2>
                <p className="text-sm text-slate-500">{message.email}</p>
              </div>
              <div className="text-sm text-slate-500">{message.createdAt.toLocaleString()}</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.message}</p>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}

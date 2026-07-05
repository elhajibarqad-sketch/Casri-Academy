import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });

  return (
    <DashboardShell>
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">Profile settings</h1>
      <form action="/api/profile" method="post" className="mt-8 grid max-w-xl gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
        <input name="name" required defaultValue={user?.name ?? ""} placeholder="Display name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
        <input name="phone" defaultValue={user?.profile?.phone ?? ""} placeholder="Phone" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
        <textarea name="bio" defaultValue={user?.profile?.bio ?? ""} placeholder="Bio" rows={5} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
        <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">Save profile</button>
      </form>
    </DashboardShell>
  );
}

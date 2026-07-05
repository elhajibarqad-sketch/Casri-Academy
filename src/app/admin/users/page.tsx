import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      googleVerified: true,
      phoneVerified: true,
      enrollments: { select: { id: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Users management</h1>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
              <tr>
                {["Name", "Email", "Role", "Verification", "Enrollments", "Status"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={6}>No users found.</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                  <td className="px-5 py-4 text-slate-500">{user.email}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">{user.role}</span></td>
                  <td className="px-5 py-4 text-slate-500">Google: {user.googleVerified ? "yes" : "no"}<br />Phone: {user.phoneVerified ? "yes" : "no"}</td>
                  <td className="px-5 py-4 text-slate-500">{user.enrollments.length}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">{user.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

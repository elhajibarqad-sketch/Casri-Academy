import { DashboardShell } from "@/components/dashboard-shell";
import { AdminCoursesManager } from "@/components/admin/admin-courses-manager";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminCoursesPage() {
  await requireAdmin();

  return (
    <DashboardShell admin>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Course management</h1>
        </div>
        <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
          New course
        </button>
      </div>

      <AdminCoursesManager />
    </DashboardShell>
  );
}

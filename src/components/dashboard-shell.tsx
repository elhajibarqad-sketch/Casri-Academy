import { AppSidebar } from "./app-sidebar";

export function DashboardShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  return (
    <main className="grid min-h-screen bg-slate-50 dark:bg-slate-900 lg:grid-cols-[280px_1fr]">
      <AppSidebar admin={admin} />
      <section className="min-w-0 p-4 sm:p-5 lg:p-8">{children}</section>
    </main>
  );
}

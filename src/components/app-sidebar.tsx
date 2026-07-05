import Link from "next/link";
import { BarChart3, Bell, BookOpen, CreditCard, FileBadge, Gauge, GraduationCap, ImageIcon, LifeBuoy, Settings, Shield, UserRoundCheck, Users } from "lucide-react";
import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";

const userLinks = [
  ["Dashboard", "/dashboard", Gauge],
  ["My courses", "/dashboard/courses", BookOpen],
  ["Profile", "/dashboard/profile", Settings],
];

const adminLinks = [
  ["Admin", "/admin", Shield],
  ["Courses", "/admin/courses", BookOpen],
  ["Learners", "/admin/users", Users],
  ["Enrollments", "/admin/enrollments", UserRoundCheck],
  ["Orders", "/admin/orders", CreditCard],
  ["Certificates", "/admin/certificates", FileBadge],
  ["Instructors", "/admin/instructors", GraduationCap],
  ["Website Content", "/admin/content", ImageIcon],
  ["Notifications", "/admin/notifications", Bell],
  ["Support", "/admin/support", LifeBuoy],
  ["Analytics", "/admin/analytics", BarChart3],
];

export function AppSidebar({ admin = false }: { admin?: boolean }) {
  const links = admin ? adminLinks : userLinks;
  return (
    <aside className="border-b border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950 lg:border-b-0 lg:border-r lg:p-5">
      <div className="flex items-center justify-between gap-4 lg:block">
        <Logo />
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
          {admin ? "Admin" : "User"}
        </span>
      </div>
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:grid lg:overflow-visible lg:pb-0">
        {links.map(([label, href, Icon]) => (
          <Link key={href as string} href={href as string} className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-cyan-600 dark:text-slate-300 dark:hover:bg-white/10">
            <Icon size={18} /> {label as string}
          </Link>
        ))}
        <LogoutButton />
      </nav>
    </aside>
  );
}

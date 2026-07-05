import Link from "next/link";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

const navItems = [
  ["Courses", "/courses"],
  ["Roadmap", "/roadmap"],
  ["Live Market", "/live-market"],
  ["Blog", "/blog"],
  ["Resources", "/resources"],
  ["FAQ", "/faq"],
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-cyan-500">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <ThemeToggle />
          <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 sm:block">
            Login
          </Link>
          <Link href="/signup" className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 sm:inline-flex">
            Start learning
          </Link>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}

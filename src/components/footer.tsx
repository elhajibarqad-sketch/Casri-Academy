import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "./logo";

const socials = [
  ["X", "https://x.com"],
  ["YouTube", "https://youtube.com"],
  ["Instagram", "https://instagram.com"],
  ["LinkedIn", "https://linkedin.com"],
  ["GitHub", "https://github.com"],
] as const;

const footerLinks = [
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Support", "/support"],
  ["FAQ", "/faq"],
  ["Glossary", "/glossary"],
  ["Resources", "/resources"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Casri Academy teaches trading as structured education: risk, market literacy, discipline, and security.
            Education only. Not financial advice.
          </p>
        </div>
        <div className="grid gap-4">
          <nav className="flex flex-wrap items-center gap-3">
            {footerLinks.map(([label, href]) => (
              <Link key={label} href={href} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-cyan-300 hover:text-cyan-500 dark:border-white/10 dark:text-slate-400">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
          {socials.map(([label, href]) => (
            <Link key={label} href={href} target="_blank" className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-500 dark:border-white/10 dark:text-slate-400">
              {label} <ExternalLink size={14} />
            </Link>
          ))}
          </div>
          <p className="text-sm font-semibold text-slate-400">Copyright {new Date().getFullYear()} Casri Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

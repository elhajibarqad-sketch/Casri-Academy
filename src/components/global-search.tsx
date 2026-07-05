"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const searchItems = [
  ["Courses", "/courses", "Forex, crypto, blockchain, risk management, technical analysis courses"],
  ["Live Market", "/live-market", "TradingView charts, crypto prices, Forex rates, market analysis"],
  ["Blog", "/blog", "Articles, blockchain insights, Bitcoin, Ethereum, DeFi, Web3 education"],
  ["Learning Roadmap", "/roadmap", "Beginner to expert curriculum path and learning milestones"],
  ["Resource Library", "/resources", "Templates, checklists, worksheets, security resources"],
  ["Glossary", "/glossary", "Crypto, Forex, blockchain, wallet, DeFi, and risk terminology"],
  ["FAQ", "/faq", "Frequently asked questions about courses, payments, certificates, accounts"],
  ["Support", "/support", "Contact support, account help, billing, course access"],
  ["Privacy Policy", "/privacy", "Privacy, user data, account information"],
  ["Terms of Service", "/terms", "Education-only terms, usage rules, no financial advice"],
] as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems;
    return searchItems.filter(([title, , body]) => `${title} ${body}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        aria-label="Open global search"
      >
        <Search size={18} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Global search">
          <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, articles, glossary..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {results.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">No results found.</div>
              ) : (
                results.map(([title, href, body]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-2xl p-4 transition hover:bg-slate-100 dark:hover:bg-white/10">
                    <span className="block font-black text-slate-950 dark:text-white">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

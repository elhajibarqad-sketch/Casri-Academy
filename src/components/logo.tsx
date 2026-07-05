import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Casri Academy home">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-cyan-300/40 bg-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
        <span className="absolute h-8 w-5 rotate-[-24deg] scale-x-150 rounded-full border-2 border-emerald-300/70" />
        <span className="relative text-sm font-black tracking-normal text-cyan-100">CA</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">Casri Academy</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">Forex & Crypto education</span>
      </span>
    </Link>
  );
}

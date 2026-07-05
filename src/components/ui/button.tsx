import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5",
        variant === "primary" && "bg-slate-950 text-white shadow-soft hover:bg-cyan-600 dark:bg-white dark:text-slate-950",
        variant === "secondary" && "border border-slate-200 bg-white/70 text-slate-800 hover:border-cyan-300 dark:border-white/10 dark:bg-white/10 dark:text-white",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
        className,
      )}
    >
      {children}
    </Link>
  );
}

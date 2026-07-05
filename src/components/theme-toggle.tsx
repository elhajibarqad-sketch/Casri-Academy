"use client";

import { Moon, Sun } from "lucide-react";
import { useCasriTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useCasriTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      aria-label="Toggle color theme"
    >
      {mounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

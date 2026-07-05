"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
}>({
  theme: "light",
  mounted: false,
  toggleTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("casri-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = saved === "dark" || saved === "light" ? saved : preferred;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    queueMicrotask(() => {
      setTheme(nextTheme);
      setMounted(true);
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      mounted,
      toggleTheme: () => {
        setTheme((current) => {
          const nextTheme = current === "dark" ? "light" : "dark";
          window.localStorage.setItem("casri-theme", nextTheme);
          document.documentElement.classList.toggle("dark", nextTheme === "dark");
          return nextTheme;
        });
      },
    }),
    [mounted, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useCasriTheme() {
  return useContext(ThemeContext);
}

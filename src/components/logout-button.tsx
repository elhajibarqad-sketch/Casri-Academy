"use client";

import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    try {
      await signOut(getFirebaseClientAuth());
    } catch {
      // Firebase may be unconfigured for legacy admin sessions; the server session is already cleared.
    }
    window.location.assign("/login");
  }

  return (
    <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-white/10">
      <LogOut size={18} /> Logout
    </button>
  );
}

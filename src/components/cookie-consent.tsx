"use client";

import { useSyncExternalStore } from "react";

const storageKey = "casri_cookie_consent";
const changeEvent = "casri-cookie-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(storageKey) !== "accepted";
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-3xl rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-950">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Casri Academy uses essential cookies for login, security, theme preference, and learning progress. Analytics should be enabled only with privacy-safe settings.
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(storageKey, "accepted");
            window.dispatchEvent(new Event(changeEvent));
          }}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

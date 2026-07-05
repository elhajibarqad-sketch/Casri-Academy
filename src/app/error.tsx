"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-center dark:bg-slate-950">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-rose-500">500</div>
        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Something went wrong</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">The page could not load. Try again, or return to the homepage.</p>
        <button onClick={reset} className="mt-7 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
          Try again
        </button>
      </div>
    </main>
  );
}

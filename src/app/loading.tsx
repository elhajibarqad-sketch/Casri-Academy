export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-5 h-8 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-4 space-y-3">
          <div className="h-3 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </main>
  );
}

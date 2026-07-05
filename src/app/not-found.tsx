import Link from "next/link";
import { PageFrame } from "@/components/page-frame";

export default function NotFound() {
  return (
    <PageFrame>
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 py-16 text-center">
        <div>
          <div className="text-sm font-black uppercase tracking-[0.2em] text-cyan-500">404</div>
          <h1 className="mt-4 text-5xl font-black text-slate-950 dark:text-white">Page not found</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">The page may have moved, or the lesson path is no longer available.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
            Back to home
          </Link>
        </div>
      </main>
    </PageFrame>
  );
}

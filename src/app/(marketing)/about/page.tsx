import { PageFrame, PageHero } from "@/components/page-frame";

const values = ["Security-first learning", "Risk before profit", "Clarity over hype", "Structured practice", "Transparent progress"];

export default function AboutPage() {
  return (
    <PageFrame>
      <PageHero
        eyebrow="About Casri Academy"
        title="A modern academy for disciplined market education."
        body="Casri Academy exists to turn noisy Forex and Crypto learning into a calm curriculum with protected content, real market context, progress tracking, and admin-grade operations."
      />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-5 md:grid-cols-5">
          {values.map((value) => (
            <div key={value} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-700 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {value}
            </div>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

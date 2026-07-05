import { PageFrame, PageHero } from "@/components/page-frame";

export const metadata = {
  title: "Terms of Service | Casri Academy",
  description: "Terms of Service for Casri Academy learners and visitors.",
};

export default function TermsPage() {
  return (
    <PageFrame>
      <PageHero eyebrow="Terms" title="Terms of Service" body="Casri Academy provides educational content only and does not provide financial advice, trading signals, brokerage, or order execution services." />
      <section className="mx-auto max-w-4xl px-5 py-12 text-slate-600 dark:text-slate-300">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <p className="leading-7">Learners are responsible for their own decisions and should treat all academy materials as education and market literacy content. Full production terms should be reviewed with legal counsel before launch.</p>
        </div>
      </section>
    </PageFrame>
  );
}

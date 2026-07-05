import { PageFrame, PageHero } from "@/components/page-frame";

export const metadata = {
  title: "Privacy Policy | Casri Academy",
  description: "Privacy information for Casri Academy learners and visitors.",
};

export default function PrivacyPage() {
  return (
    <PageFrame>
      <PageHero eyebrow="Privacy" title="Privacy Policy" body="Casri Academy collects only the information needed to operate learning accounts, course access, support, and academy communications." />
      <section className="mx-auto max-w-4xl px-5 py-12 text-slate-600 dark:text-slate-300">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <p className="leading-7">We protect learner information, never sell personal data, and use secure systems for authentication, payments, and course access. Full production policies should be reviewed with legal counsel before launch.</p>
        </div>
      </section>
    </PageFrame>
  );
}

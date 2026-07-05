import { InfoGridPage } from "@/components/marketing/info-grid-page";

export const metadata = {
  title: "FAQ | Casri Academy",
  description: "Frequently asked questions about Casri Academy courses, payments, certificates, accounts, and educational content.",
};

const items = [
  { title: "Does Casri Academy provide trading signals?", body: "No. The platform is education-only and does not provide financial advice, trading signals, brokerage, or order execution." },
  { title: "Can I preview lessons before buying?", body: "Yes. Courses can include free preview lessons so students can review the teaching style before enrolling." },
  { title: "How does course progress work?", body: "Lesson completion is tracked in your dashboard and contributes to the course completion percentage." },
  { title: "Are certificates supported?", body: "Yes. Certificate records are already part of the platform and can be issued after completion requirements are met." },
  { title: "How are paid courses unlocked?", body: "Paid course access opens after payment confirmation or staff approval, depending on the payment method." },
  { title: "Is live market data financial advice?", body: "No. Live charts and market data are provided only for educational analysis and market literacy." },
];

export default function FAQPage() {
  return <InfoGridPage eyebrow="FAQ" title="Common questions, clear answers." body="Find answers about learning, accounts, payments, certificates, and the education-only scope of Casri Academy." items={items} />;
}

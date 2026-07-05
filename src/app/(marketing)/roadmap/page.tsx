import { InfoGridPage } from "@/components/marketing/info-grid-page";

export const metadata = {
  title: "Learning Roadmap | Casri Academy",
  description: "A structured learning path for cryptocurrency, Forex, blockchain, market analysis, and risk management.",
};

const items = [
  { meta: "Step 01", title: "Beginner Foundations", body: "Learn market vocabulary, asset classes, exchanges, wallets, chart basics, and education-only risk concepts." },
  { meta: "Step 02", title: "Blockchain Literacy", body: "Study ledgers, consensus, smart contracts, stablecoins, DeFi, Web3 identity, and security hygiene." },
  { meta: "Step 03", title: "Market Analysis", body: "Understand candlesticks, support and resistance, moving averages, volume, economic calendars, and macro context." },
  { meta: "Step 04", title: "Risk Management", body: "Build discipline around position sizing concepts, drawdowns, invalidation, journaling, and capital protection." },
  { meta: "Step 05", title: "Practice and Review", body: "Use quizzes, notes, watchlists, and lesson progress to turn market knowledge into repeatable learning habits." },
  { meta: "Step 06", title: "Certificate Readiness", body: "Complete lessons, review assessments, and unlock certificates when course completion requirements are met." },
];

export default function RoadmapPage() {
  return <InfoGridPage eyebrow="Roadmap" title="A clear learning path from beginner to confident analyst." body="Casri Academy organizes Forex and Crypto education into structured stages so students always know what to study next." items={items} />;
}

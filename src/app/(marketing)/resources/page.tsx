import { InfoGridPage } from "@/components/marketing/info-grid-page";

export const metadata = {
  title: "Resource Library | Casri Academy",
  description: "Educational crypto and Forex resources, worksheets, checklists, and learning templates.",
};

const items = [
  { meta: "Checklist", title: "Wallet Security Checklist", body: "Seed phrase storage, phishing awareness, device hygiene, approval reviews, and recovery planning." },
  { meta: "Template", title: "Market Journal Template", body: "A structured worksheet for observations, emotions, chart context, and post-lesson reflection." },
  { meta: "Guide", title: "Candlestick Reading Guide", body: "A visual guide to candle bodies, wicks, ranges, and market structure vocabulary." },
  { meta: "Worksheet", title: "Risk Planning Worksheet", body: "Practice thinking through drawdown, exposure, invalidation, and scenario planning." },
  { meta: "Reference", title: "Economic Calendar Guide", body: "Learn why CPI, GDP, NFP, interest rates, and FOMC events matter to market analysis." },
  { meta: "Library", title: "Recommended Learning Path", body: "Curated links across courses, blog articles, glossary terms, and live market analysis pages." },
];

export default function ResourcesPage() {
  return <InfoGridPage eyebrow="Resources" title="A focused library for market learners." body="Use these educational resources to support your lessons, notes, review process, and security habits." items={items} />;
}

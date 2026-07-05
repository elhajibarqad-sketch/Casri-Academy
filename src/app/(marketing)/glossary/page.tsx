import { InfoGridPage } from "@/components/marketing/info-grid-page";

export const metadata = {
  title: "Crypto Glossary | Casri Academy",
  description: "Beginner-friendly definitions for cryptocurrency, blockchain, Forex, DeFi, wallets, and risk terms.",
};

const items = [
  { meta: "Bitcoin", title: "BTC", body: "Bitcoin is a decentralized digital asset secured by proof-of-work mining and a public ledger." },
  { meta: "Ethereum", title: "Smart Contract", body: "Code deployed on a blockchain that can execute predefined actions when conditions are met." },
  { meta: "Security", title: "Seed Phrase", body: "A recovery phrase that controls wallet access. It should be stored offline and never shared." },
  { meta: "DeFi", title: "Liquidity Pool", body: "A pool of assets used by decentralized protocols to support swaps, lending, or other financial mechanics." },
  { meta: "Forex", title: "Currency Pair", body: "A quote comparing one currency against another, such as EUR/USD or USD/JPY." },
  { meta: "Risk", title: "Drawdown", body: "The decline from an account or strategy peak to a lower value, used in risk education and review." },
  { meta: "Charts", title: "Support and Resistance", body: "Areas where price has previously reacted. They are study zones, not guaranteed turning points." },
  { meta: "Market Data", title: "Volume", body: "A measure of trading activity that helps learners understand participation and liquidity." },
  { meta: "Web3", title: "Layer 2", body: "A scaling network built around a base blockchain to improve speed, cost, or throughput." },
];

export default function GlossaryPage() {
  return <InfoGridPage eyebrow="Glossary" title="Crypto and Forex terms in plain language." body="A beginner-friendly glossary for students learning blockchain, market analysis, wallets, DeFi, and risk concepts." items={items} />;
}

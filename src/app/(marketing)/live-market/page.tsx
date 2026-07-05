import { LiveMarketAnalysis } from "@/components/marketing/live-market-analysis";
import { PageFrame } from "@/components/page-frame";

export const metadata = {
  title: "Live Market Analysis | Casri Academy",
  description: "Educational cryptocurrency and Forex market analysis with real-time charts and market data.",
};

export default function LiveMarketPage() {
  return (
    <PageFrame>
      <LiveMarketAnalysis />
    </PageFrame>
  );
}

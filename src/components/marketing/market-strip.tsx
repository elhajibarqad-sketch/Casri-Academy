import { getLiveMarketData, type MarketCard } from "@/lib/market/client";

export async function MarketStrip() {
  let cards: MarketCard[] = [];
  try {
    cards = await getLiveMarketData();
  } catch {
    cards = [];
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {cards.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          Live market data is temporarily unavailable.
        </div>
      ) : (
        cards.map((card) => (
          <div key={card.symbol} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-semibold uppercase text-slate-400">{card.name}</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <div className="text-lg font-black text-slate-950 dark:text-white">{card.symbol}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{card.value}</div>
              </div>
              <div className={card.change >= 0 ? "text-sm font-bold text-emerald-500" : "text-sm font-bold text-rose-500"}>
                {card.type === "crypto" ? `${card.change.toFixed(2)}%` : "FX"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

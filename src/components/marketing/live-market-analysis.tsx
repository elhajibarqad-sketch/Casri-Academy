"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CandlestickChart,
  Gauge,
  Globe2,
  LineChart,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MarketCard = {
  symbol: string;
  name: string;
  value: string;
  change: number;
  type: "crypto" | "forex";
};

type CryptoRow = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
  high24h: number;
  low24h: number;
  volatility: number;
};

type ForexRow = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

type MarketPayload = {
  data: MarketCard[];
  crypto: CryptoRow[];
  forex: ForexRow[];
  global: {
    totalMarketCap: number;
    totalVolume: number;
    bitcoinDominance: number;
    ethereumDominance: number;
  } | null;
  updatedAt: string;
  disclaimer: string;
};

type MarketMode = "crypto" | "forex";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

const cryptoSymbols = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD"];
const forexSymbols = ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD"];
const ranges = ["24 Hours", "7 Days", "30 Days", "90 Days", "6 Months", "1 Year"];
const marketTabs = [
  { key: "crypto" as const, label: "Cryptocurrency Market", Icon: CandlestickChart },
  { key: "forex" as const, label: "Forex (FX) Market", Icon: Globe2 },
];

const technicalRows = [
  ["RSI", "52.4", "Measures speed and size of recent price moves to study momentum conditions."],
  ["MACD", "Neutral", "Compares moving averages to visualize momentum shifts and crossovers."],
  ["EMA", "Above price", "Gives more weight to recent candles and helps learners study dynamic trend areas."],
  ["SMA", "Flat", "Smooths price over a selected period to reduce short-term market noise."],
  ["Bollinger Bands", "Medium width", "Shows volatility expansion and contraction around a moving average."],
  ["Trend Direction", "Range to upward", "Describes structure using highs, lows, and moving-average position."],
  ["Momentum", "Balanced", "Summarizes whether recent candles are accelerating or slowing."],
  ["Volume Analysis", "Normal", "Compares current participation with typical market activity."],
];

const calendarEvents = [
  ["Jul 09", "13:30", "USD", "High", "CPI", "3.1%", "3.0%", "-"],
  ["Jul 10", "07:00", "GBP", "Medium", "GDP", "0.2%", "0.1%", "-"],
  ["Jul 17", "12:15", "EUR", "High", "Interest Rate Decision", "4.25%", "4.25%", "-"],
  ["Aug 01", "13:30", "USD", "High", "Non-Farm Payroll", "206K", "190K", "-"],
  ["Aug 12", "19:00", "USD", "High", "FOMC Meeting Minutes", "-", "-", "-"],
];

const insights = [
  ["Technical indicators", "Indicators transform price, volume, or volatility into structured readings. They are best studied as context, not as instructions."],
  ["Candlestick charts", "Each candle shows open, high, low, and close. Wicks reveal rejected prices, while candle bodies show where price accepted value."],
  ["Trend identification", "Learners compare higher highs, lower lows, moving averages, and market structure to understand direction and range conditions."],
  ["Support and resistance", "These are areas where price previously reacted. They are zones for analysis, not guaranteed turning points."],
  ["Risk management", "Position sizing, invalidation points, and maximum loss planning are core education topics before any live-market decision."],
  ["Crypto vs Forex", "Crypto trades continuously and can be highly volatile. Forex follows global sessions and reacts heavily to macroeconomic data."],
];

function money(value: number, compact = true) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1000 ? 0 : 2,
    notation: compact && value > 999999 ? "compact" : "standard",
  }).format(value || 0);
}

function percent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function price(value: number, symbol?: string) {
  if (!value) return "Unavailable";
  if (symbol?.includes("JPY")) return value.toFixed(2);
  if (symbol?.includes("/")) return value.toFixed(4);
  return money(value, false);
}

function chartSymbol(mode: MarketMode, symbol: string) {
  const cryptoMap: Record<string, string> = {
    "BTC/USD": "COINBASE:BTCUSD",
    "ETH/USD": "COINBASE:ETHUSD",
    "SOL/USD": "COINBASE:SOLUSD",
    "BNB/USD": "BINANCE:BNBUSD",
    "XRP/USD": "BITSTAMP:XRPUSD",
  };
  const forexMap: Record<string, string> = {
    "EUR/USD": "FX:EURUSD",
    "GBP/USD": "FX:GBPUSD",
    "USD/JPY": "FX:USDJPY",
    "GBP/JPY": "FX:GBPJPY",
    "AUD/USD": "FX:AUDUSD",
    "USD/CAD": "FX:USDCAD",
  };

  return mode === "crypto" ? cryptoMap[symbol] : forexMap[symbol];
}

function TradingViewChart({ mode, symbol }: { mode: MarketMode; symbol: string }) {
  const { resolvedTheme } = useTheme();
  const containerId = "tradingview-live-market";
  const mounted = useRef(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const createWidget = () => {
      if (!window.TradingView?.widget) return;
      container.innerHTML = "";
      new window.TradingView.widget({
        autosize: true,
        symbol: chartSymbol(mode, symbol),
        interval: "60",
        timezone: "Etc/UTC",
        theme: resolvedTheme === "light" ? "light" : "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        withdateranges: true,
        details: true,
        hotlist: false,
        calendar: true,
        studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "MASimple@tv-basicstudies", "BB@tv-basicstudies", "Volume@tv-basicstudies"],
        container_id: containerId,
      });
    };

    if (window.TradingView?.widget) {
      createWidget();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://s3.tradingview.com/tv.js"]');
    if (existing) {
      existing.addEventListener("load", createWidget, { once: true });
      return () => existing.removeEventListener("load", createWidget);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = createWidget;
    document.head.appendChild(script);
    mounted.current = true;

    return () => {
      if (mounted.current && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [mode, resolvedTheme, symbol]);

  return <div id={containerId} className="h-[420px] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 md:h-[620px]" />;
}

function MetricCard({ label, value, detail, change }: { label: string; value: string; detail?: string; change?: number }) {
  const positive = (change ?? 0) >= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{detail ?? "Live market context"}</span>
        {typeof change === "number" && (
          <span className={positive ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{percent(change)}</span>
        )}
      </div>
    </motion.div>
  );
}

function MiniTrend({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
      <Icon className="h-3.5 w-3.5" />
      {percent(value)}
    </span>
  );
}

function buildHistory(active: CryptoRow | ForexRow | undefined, selectedRange: string) {
  const base = active && "price" in active ? active.price : 100;
  const points = selectedRange === "24 Hours" ? 12 : selectedRange === "7 Days" ? 14 : selectedRange === "30 Days" ? 18 : 24;
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin(index / 2.1) * 0.018 + Math.cos(index / 3.4) * 0.011;
    const drift = (index - points / 2) * 0.0015;
    const close = base * (1 + wave + drift);
    return {
      label: index === points - 1 ? "Now" : `${index + 1}`,
      price: Number(close.toFixed(4)),
      volume: Math.max(12, Math.round(50 + Math.sin(index / 1.7) * 25 + index * 1.7)),
    };
  });
}

export function LiveMarketAnalysis() {
  const [mode, setMode] = useState<MarketMode>("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC/USD");
  const [selectedForex, setSelectedForex] = useState("EUR/USD");
  const [selectedRange, setSelectedRange] = useState("30 Days");
  const [payload, setPayload] = useState<MarketPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/market")
      .then((response) => response.json())
      .then((data: MarketPayload) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (active) setPayload(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const currentSymbol = mode === "crypto" ? selectedCrypto : selectedForex;
  const activeCrypto = payload?.crypto.find((item) => currentSymbol.startsWith(item.symbol));
  const activeForex = payload?.forex.find((item) => item.symbol === currentSymbol);
  const history = useMemo(() => buildHistory(mode === "crypto" ? activeCrypto : activeForex, selectedRange), [activeCrypto, activeForex, mode, selectedRange]);
  const watchlist = mode === "crypto" ? payload?.crypto ?? [] : payload?.forex ?? [];
  const selectedSymbols = mode === "crypto" ? cryptoSymbols : forexSymbols;

  const overview = mode === "crypto" && activeCrypto
    ? [
        ["Current Price", price(activeCrypto.price), activeCrypto.change24h],
        ["24H Change", percent(activeCrypto.change24h), activeCrypto.change24h],
        ["7-Day Change", percent(activeCrypto.change7d), activeCrypto.change7d],
        ["Market Cap", money(activeCrypto.marketCap), activeCrypto.change24h],
        ["Volume", money(activeCrypto.volume), activeCrypto.change24h],
        ["High", price(activeCrypto.high24h), activeCrypto.change24h],
        ["Low", price(activeCrypto.low24h), activeCrypto.change24h],
        ["Volatility", percent(activeCrypto.volatility), activeCrypto.volatility],
      ]
    : activeForex
      ? [
          ["Current Price", price(activeForex.price, activeForex.symbol), activeForex.change24h],
          ["24H Change", percent(activeForex.change24h), activeForex.change24h],
          ["7-Day Change", "FX provider required", 0],
          ["Market Cap", "Not applicable", 0],
          ["Volume", "Decentralized FX", 0],
          ["High", "Chart tool", 0],
          ["Low", "Chart tool", 0],
          ["Volatility", "Session based", activeForex.change24h],
        ]
      : [];

  return (
    <main className="bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              <Activity className="h-4 w-4" />
              Real-time education dashboard
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">Live Market Analysis</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Analyze cryptocurrency and Forex markets using professional real-time charts and market data. This page is designed for education and market analysis only.
            </p>
            <div className="mt-6 flex max-w-3xl gap-3 rounded-[1.25rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-semibold leading-6 text-amber-100">
              <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" />
              Educational purposes only. This platform does not provide financial advice, trading signals, or trading services.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="BTC Dominance" value={payload?.global ? percent(payload.global.bitcoinDominance) : loading ? "Loading" : "Unavailable"} detail="CoinGecko global market" />
            <MetricCard label="Total Volume" value={payload?.global ? money(payload.global.totalVolume) : loading ? "Loading" : "Unavailable"} detail="Crypto market activity" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:py-12">
        <div className="sticky top-3 z-20 mb-6 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-2 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-2 sm:grid-cols-2">
            {marketTabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex items-center justify-center gap-2 rounded-[1.1rem] px-4 py-3 text-sm font-black transition ${mode === key ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-3 flex flex-col gap-3 px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Advanced chart</div>
                <div className="mt-1 text-2xl font-black">{currentSymbol}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymbols.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => (mode === "crypto" ? setSelectedCrypto(symbol) : setSelectedForex(symbol))}
                    className={`rounded-full px-3 py-2 text-xs font-black transition ${currentSymbol === symbol ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            <TradingViewChart mode={mode} symbol={currentSymbol} />
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Watchlist</h2>
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-5 grid gap-3">
              {watchlist.length === 0 ? (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">Live watchlist data is temporarily unavailable.</div>
              ) : (
                watchlist.map((item) => {
                  const symbol = "symbol" in item ? item.symbol : "";
                  const label = mode === "crypto" ? `${symbol}/USD` : symbol;
                  const value = mode === "crypto" ? price((item as CryptoRow).price) : price((item as ForexRow).price, symbol);
                  const change = mode === "crypto" ? (item as CryptoRow).change24h : (item as ForexRow).change24h;

                  return (
                    <button
                      key={symbol}
                      onClick={() => (mode === "crypto" ? setSelectedCrypto(label) : setSelectedForex(symbol))}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                    >
                      <span>
                        <span className="block font-black text-white">{label}</span>
                        <span className="text-sm text-slate-400">{value}</span>
                      </span>
                      <MiniTrend value={change} />
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {overview.map(([label, value, change]) => (
            <MetricCard key={label as string} label={label as string} value={value as string} change={change as number} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Technical Analysis Panel</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Educational summaries only. No buy, sell, or signal recommendations are shown.</p>
            <div className="mt-5 grid gap-3">
              {technicalRows.map(([name, value, explanation]) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-black text-white">{name}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">{value}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{explanation}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-black">Historical Performance</h2>
                </div>
                <p className="mt-2 text-sm text-slate-400">Interactive educational comparison by selected range.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ranges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-full px-3 py-2 text-xs font-black transition ${selectedRange === range ? "bg-white text-slate-950" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tickLine={false} axisLine={false} domain={["dataMin", "dataMax"]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                  <Area yAxisId="left" type="monotone" dataKey="price" stroke="#67e8f9" fill="#0891b2" fillOpacity={0.22} strokeWidth={3} />
                  <Bar yAxisId="right" dataKey="volume" fill="#64748b" radius={[6, 6, 0, 0]} opacity={0.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Crypto Market Statistics</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Total Market Cap" value={payload?.global ? money(payload.global.totalMarketCap) : "Unavailable"} />
              <MetricCard label="Bitcoin Dominance" value={payload?.global ? percent(payload.global.bitcoinDominance) : "Unavailable"} />
              <MetricCard label="Ethereum Dominance" value={payload?.global ? percent(payload.global.ethereumDominance) : "Unavailable"} />
              <MetricCard label="Total Trading Volume" value={payload?.global ? money(payload.global.totalVolume) : "Unavailable"} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Top Gainers", "Top Losers", "Most Active Coins"].map((label, index) => {
                const sorted = [...(payload?.crypto ?? [])].sort((a, b) => (index === 1 ? a.change24h - b.change24h : index === 2 ? b.volume - a.volume : b.change24h - a.change24h));
                return (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</div>
                    <div className="mt-3 space-y-2">
                      {sorted.slice(0, 3).map((coin) => (
                        <div key={`${label}-${coin.symbol}`} className="flex items-center justify-between text-sm">
                          <span className="font-bold">{coin.symbol}</span>
                          <MiniTrend value={coin.change24h} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Forex Market Overview</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Major Currency Pairs", "EUR/USD, GBP/USD, USD/JPY"],
                ["Minor Currency Pairs", "EUR/GBP, AUD/JPY, CAD/JPY"],
                ["Exotic Currency Pairs", "USD/ZAR, USD/MXN, EUR/TRY"],
                ["Daily Movers", payload?.forex?.map((item) => `${item.symbol} ${percent(item.change24h)}`).slice(0, 3).join(" | ") ?? "Loading"],
                ["Market Sessions", "Sydney, Tokyo, London, New York"],
                ["Currency Strength Overview", "Compare pair movement, session context, and macro events."],
              ].map(([label, text]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="font-black">{label}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Economic Calendar</h2>
            </div>
            <div className="mt-5 max-w-full overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    {["Date", "Time", "Currency", "Impact", "Event", "Previous", "Forecast", "Actual"].map((head) => (
                      <th key={head} className="border-b border-white/10 px-3 py-3">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarEvents.map((event) => (
                    <tr key={event.join("-")} className="border-b border-white/5">
                      {event.map((cell, index) => (
                        <td key={`${event[0]}-${index}`} className="px-3 py-4 text-slate-300">
                          {index === 3 ? <span className="rounded-full bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-200">{cell}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-black">Market Sentiment</h2>
            </div>
            <div className="mt-5 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Fear & Greed", value: 54 },
                  { name: "BTC Dom.", value: payload?.global?.bitcoinDominance ?? 0 },
                  { name: "Alt Season", value: 42 },
                  { name: "FX Vol.", value: Math.min(100, Math.abs(activeForex?.change24h ?? 0) * 20 + 28) },
                  { name: "Strength", value: 61 },
                ]}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {["#67e8f9", "#22c55e", "#a78bfa", "#f59e0b", "#38bdf8"].map((color) => <Cell key={color} fill={color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 grid gap-3">
              {["Fear & Greed Index", "BTC Dominance", "Altcoin Season Indicator", "Market Volatility", "Currency Strength Meter", "Trend Heatmap"].map((label) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <span className="font-bold">{label}</span>
                  <span className="text-sm text-slate-400">Educational context</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-black">Educational Insights</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {insights.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <h3 className="font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-900 p-5 text-sm leading-6 text-slate-300" aria-label="Educational disclaimer">
          This page is intended solely for educational and analytical purposes. The information presented should not be considered financial, investment, or trading advice. Users should conduct their own research before making any financial decisions.
        </section>
      </section>
    </main>
  );
}

const CRYPTO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h,7d";
const CRYPTO_GLOBAL_URL = "https://api.coingecko.com/api/v3/global";
const FOREX_URL = "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,AUD,CAD";

export type MarketCard = {
  symbol: string;
  name: string;
  value: string;
  change: number;
  type: "crypto" | "forex";
};

export type CryptoMarketRow = {
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

export type ForexMarketRow = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

export type CryptoGlobalStats = {
  totalMarketCap: number;
  totalVolume: number;
  bitcoinDominance: number;
  ethereumDominance: number;
};

export type LiveMarketPayload = {
  cards: MarketCard[];
  crypto: CryptoMarketRow[];
  forex: ForexMarketRow[];
  global: CryptoGlobalStats | null;
  updatedAt: string;
};

type CoinGeckoMarket = {
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
};

type CoinGeckoGlobal = {
  data?: {
    total_market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    market_cap_percentage?: { btc?: number; eth?: number };
  };
};

type FrankfurterResponse = {
  rates?: Record<string, number>;
};

function formatUsd(value: number) {
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: value > 1000 ? 0 : 2 })}`;
}

function toPercent(value: number | null | undefined) {
  return Number(value ?? 0);
}

function rateChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function previousDatePath() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function pairPrice(rates: Record<string, number>, symbol: string) {
  switch (symbol) {
    case "EUR/USD":
      return rates.EUR ? 1 / rates.EUR : 0;
    case "GBP/USD":
      return rates.GBP ? 1 / rates.GBP : 0;
    case "USD/JPY":
      return rates.JPY ?? 0;
    case "GBP/JPY":
      return rates.GBP && rates.JPY ? rates.JPY / rates.GBP : 0;
    case "AUD/USD":
      return rates.AUD ? 1 / rates.AUD : 0;
    case "USD/CAD":
      return rates.CAD ?? 0;
    default:
      return 0;
  }
}

async function safeJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getLiveMarketPayload(): Promise<LiveMarketPayload> {
  const previousForexUrl = `https://api.frankfurter.app/${previousDatePath()}?from=USD&to=EUR,GBP,JPY,AUD,CAD`;
  const [cryptoMarkets, cryptoGlobal, forexLatest, forexPrevious] = await Promise.all([
    safeJson<CoinGeckoMarket[]>(CRYPTO_MARKETS_URL, 60),
    safeJson<CoinGeckoGlobal>(CRYPTO_GLOBAL_URL, 60),
    safeJson<FrankfurterResponse>(FOREX_URL, 60 * 15),
    safeJson<FrankfurterResponse>(previousForexUrl, 60 * 60),
  ]);

  const crypto =
    cryptoMarkets?.map((coin) => {
      const price = Number(coin.current_price ?? 0);
      const high = Number(coin.high_24h ?? price);
      const low = Number(coin.low_24h ?? price);

      return {
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price,
        change24h: toPercent(coin.price_change_percentage_24h),
        change7d: toPercent(coin.price_change_percentage_7d_in_currency),
        marketCap: Number(coin.market_cap ?? 0),
        volume: Number(coin.total_volume ?? 0),
        high24h: high,
        low24h: low,
        volatility: price ? ((high - low) / price) * 100 : 0,
      };
    }) ?? [];

  const latestRates = forexLatest?.rates ?? {};
  const previousRates = forexPrevious?.rates ?? {};
  const forexSymbols = [
    ["EUR/USD", "Euro Dollar"],
    ["GBP/USD", "Pound Dollar"],
    ["USD/JPY", "Dollar Yen"],
    ["GBP/JPY", "Pound Yen"],
    ["AUD/USD", "Aussie Dollar"],
    ["USD/CAD", "Dollar Canada"],
  ] as const;
  const forex = forexSymbols.map(([symbol, name]) => {
    const current = pairPrice(latestRates, symbol);
    const previous = pairPrice(previousRates, symbol);
    return { symbol, name, price: current, change24h: rateChange(current, previous) };
  });

  const cards: MarketCard[] = [
    ...crypto.map((coin) => ({
      symbol: coin.symbol,
      name: coin.name,
      value: formatUsd(coin.price),
      change: coin.change24h,
      type: "crypto" as const,
    })),
    ...forex.slice(0, 3).map((pair) => ({
      symbol: pair.symbol,
      name: pair.name,
      value: pair.price ? pair.price.toFixed(pair.symbol.includes("JPY") ? 2 : 4) : "Unavailable",
      change: pair.change24h,
      type: "forex" as const,
    })),
  ];

  return {
    cards,
    crypto,
    forex,
    global: cryptoGlobal?.data
      ? {
          totalMarketCap: Number(cryptoGlobal.data.total_market_cap?.usd ?? 0),
          totalVolume: Number(cryptoGlobal.data.total_volume?.usd ?? 0),
          bitcoinDominance: Number(cryptoGlobal.data.market_cap_percentage?.btc ?? 0),
          ethereumDominance: Number(cryptoGlobal.data.market_cap_percentage?.eth ?? 0),
        }
      : null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveMarketData(): Promise<MarketCard[]> {
  return (await getLiveMarketPayload()).cards;
}

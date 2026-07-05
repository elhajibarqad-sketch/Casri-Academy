"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarDays, Mail, Search, ShieldCheck, Sparkles, Tag } from "lucide-react";

export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  popular?: boolean;
  source: "database" | "academy";
};

const categories = [
  "All",
  "Cryptocurrency",
  "Blockchain",
  "Bitcoin",
  "Ethereum",
  "Altcoins",
  "DeFi",
  "NFTs",
  "Web3",
  "Forex",
  "Technical Analysis",
  "Fundamental Analysis",
  "Market News",
  "Security",
  "Wallets",
  "Trading Psychology",
  "Risk Management",
  "Beginner Guides",
];

const topics = ["Bitcoin", "Ethereum", "Solana", "AI & Crypto", "Layer 2", "Stablecoins", "Tokenization", "DeFi", "Web3", "Blockchain Adoption"];

function articleHref(article: BlogArticle) {
  return article.source === "database" ? `/blog/${article.slug}` : `/blog?article=${article.slug}`;
}

function imageFor(index: number) {
  const palette = [
    "0f172a,0891b2,67e8f9",
    "111827,7c3aed,c4b5fd",
    "0f172a,16a34a,86efac",
    "18181b,eab308,fef08a",
    "020617,2563eb,93c5fd",
    "1e1b4b,db2777,f9a8d4",
  ][index % 6];
  return `https://placehold.co/1200x760/${palette}.png?text=Casri+Academy+Insight`;
}

export const academyArticles: BlogArticle[] = [
  {
    slug: "bitcoin-market-cycles-for-beginners",
    title: "Understanding Bitcoin Market Cycles Without the Hype",
    summary: "Learn how cycle narratives, liquidity, halvings, and sentiment shape Bitcoin education without turning analysis into signals.",
    category: "Bitcoin",
    author: "Casri Research Desk",
    date: "Jul 4, 2026",
    readTime: "8 min read",
    image: imageFor(0),
    featured: true,
    popular: true,
    source: "academy",
  },
  {
    slug: "blockchain-basics-ledgers-consensus",
    title: "Blockchain Basics: Ledgers, Consensus, and Network Trust",
    summary: "A clear introduction to distributed ledgers, validators, miners, finality, and why blockchain networks need consensus.",
    category: "Blockchain",
    author: "Amina Yusuf",
    date: "Jul 2, 2026",
    readTime: "6 min read",
    image: imageFor(1),
    popular: true,
    source: "academy",
  },
  {
    slug: "ethereum-smart-contracts-explained",
    title: "Ethereum Smart Contracts Explained for New Learners",
    summary: "Explore how smart contracts work, where gas fees fit in, and what students should know before using decentralized apps.",
    category: "Ethereum",
    author: "Casri Academy",
    date: "Jun 28, 2026",
    readTime: "7 min read",
    image: imageFor(2),
    source: "academy",
  },
  {
    slug: "defi-risk-literacy",
    title: "DeFi Risk Literacy: Liquidity Pools, APY, and Smart Contract Risk",
    summary: "Understand the vocabulary of DeFi risk, including impermanent loss, protocol risk, oracle risk, and liquidity mechanics.",
    category: "DeFi",
    author: "Hassan Ali",
    date: "Jun 24, 2026",
    readTime: "9 min read",
    image: imageFor(3),
    popular: true,
    source: "academy",
  },
  {
    slug: "crypto-wallet-security-checklist",
    title: "Crypto Wallet Security Checklist for Students",
    summary: "A practical education-first checklist covering seed phrases, hardware wallets, phishing, approvals, and account hygiene.",
    category: "Security",
    author: "Casri Security Lab",
    date: "Jun 20, 2026",
    readTime: "5 min read",
    image: imageFor(4),
    popular: true,
    source: "academy",
  },
  {
    slug: "technical-analysis-support-resistance",
    title: "Support and Resistance: Reading Market Structure Carefully",
    summary: "Learn how support, resistance, ranges, and trend structure are studied in technical analysis without making predictions.",
    category: "Technical Analysis",
    author: "Casri Research Desk",
    date: "Jun 18, 2026",
    readTime: "8 min read",
    image: imageFor(5),
    source: "academy",
  },
  {
    slug: "forex-and-crypto-differences",
    title: "Forex vs Crypto: Market Hours, Liquidity, and Volatility",
    summary: "Compare the structure of currency markets and digital asset markets so beginners can understand how each behaves.",
    category: "Forex",
    author: "Sahra Mohamed",
    date: "Jun 15, 2026",
    readTime: "7 min read",
    image: imageFor(6),
    source: "academy",
  },
  {
    slug: "trading-psychology-learning-journal",
    title: "Trading Psychology Starts With a Learning Journal",
    summary: "Use journaling, emotional awareness, and process review as educational tools for better market discipline.",
    category: "Trading Psychology",
    author: "Casri Academy",
    date: "Jun 11, 2026",
    readTime: "6 min read",
    image: imageFor(7),
    source: "academy",
  },
  {
    slug: "risk-management-before-strategy",
    title: "Why Risk Management Comes Before Strategy",
    summary: "An accessible guide to position sizing concepts, drawdowns, invalidation, and why risk education matters first.",
    category: "Risk Management",
    author: "Casri Research Desk",
    date: "Jun 8, 2026",
    readTime: "7 min read",
    image: imageFor(8),
    popular: true,
    source: "academy",
  },
];

function ArticleImage({ article, priority = false }: { article: BlogArticle; priority?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] bg-slate-800">
      <Image
        src={article.image}
        alt=""
        width={1200}
        height={760}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
    </div>
  );
}

function ArticleMeta({ article }: { article: BlogArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
      <span>{article.author}</span>
      <span className="h-1 w-1 rounded-full bg-slate-400" />
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="h-3.5 w-3.5" />
        {article.date}
      </span>
      <span className="h-1 w-1 rounded-full bg-slate-400" />
      <span>{article.readTime}</span>
    </div>
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.05]">
      <ArticleImage article={article} />
      <div className="p-3">
        <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-100">{article.category}</span>
        <h2 className="mt-4 text-xl font-black leading-tight text-slate-950 dark:text-white">{article.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{article.summary}</p>
        <div className="mt-4">
          <ArticleMeta article={article} />
        </div>
        <Link href={articleHref(article)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200">
          Read More <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

export function BlogIndex({ articles }: { articles: BlogArticle[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const perPage = 6;

  const featured = articles.find((article) => article.featured) ?? articles[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      const matchesQuery = !normalized || [article.title, article.summary, article.category, article.author].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, articles, query]);

  const visible = filtered.slice(0, page * perPage);
  const popular = articles.filter((article) => article.popular).slice(0, 5);

  return (
    <main className="bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-5 py-16 dark:border-white/10 dark:bg-slate-950 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
            <BookOpen className="h-4 w-4" />
            Education, blockchain, and market literacy
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl">Crypto Academy Blog</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Explore expert articles, blockchain insights, cryptocurrency education, market analysis, and the latest industry trends to expand your knowledge.
          </p>
          <label className="mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-soft dark:border-white/10 dark:bg-white/10">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search articles..."
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              aria-label="Search articles"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {featured && (
          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="group grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.05] lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <ArticleImage article={featured} priority />
            <div className="p-2 sm:p-5">
              <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-100">{featured.category}</span>
              <h2 className="mt-5 text-3xl font-black leading-tight text-slate-950 dark:text-white sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{featured.summary}</p>
              <div className="mt-5">
                <ArticleMeta article={featured} />
              </div>
              <Link href={articleHref(featured)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200">
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.article>
        )}

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setPage(1);
              }}
              className={`flex-none rounded-full border px-4 py-2 text-sm font-bold transition ${activeCategory === category ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Latest Articles</div>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{activeCategory === "All" ? "Newest education posts" : activeCategory}</h2>
              </div>
              <div className="hidden text-sm font-semibold text-slate-500 dark:text-slate-400 sm:block">{filtered.length} articles</div>
            </div>

            {visible.length === 0 ? (
              <div className="mt-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                No articles match that search yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {visible.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}

            {visible.length < filtered.length && (
              <button onClick={() => setPage((value) => value + 1)} className="mt-8 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                Load more articles
              </button>
            )}
          </div>

          <aside className="grid h-fit gap-5">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Popular Articles</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {popular.map((article, index) => (
                  <Link key={article.slug} href={articleHref(article)} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-white/10">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{index + 1}</span>
                    <span>
                      <span className="block text-sm font-black text-slate-950 dark:text-white">{article.title}</span>
                      <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{article.readTime}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-cyan-500" />
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Trending Topics</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button key={topic} onClick={() => setQuery(topic)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100">
                    {topic}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50 p-5 shadow-soft dark:border-cyan-300/20 dark:bg-cyan-300/10">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-700 dark:text-cyan-100" />
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Stay Updated</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Receive the latest educational articles, blockchain insights, and market updates directly in your inbox.
              </p>
              <form
                className="mt-4 grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const response = await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ email: form.get("email") }),
                  });
                  const data = await response.json();
                  setNewsletterStatus(response.ok ? "You are on the education updates list." : data.error ?? "Unable to subscribe.");
                  if (response.ok) event.currentTarget.reset();
                }}
              >
                <input name="email" type="email" required placeholder="Email address" className="rounded-full border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700 dark:bg-white dark:text-slate-950">Subscribe</button>
                {newsletterStatus && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{newsletterStatus}</p>}
              </form>
            </section>
          </aside>
        </div>

        <section className="mt-10 flex gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-soft dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300" aria-label="Educational disclaimer">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-cyan-500" />
          All content is provided for educational and informational purposes only. Nothing published on this website should be considered financial, investment, or trading advice.
        </section>
      </section>
    </main>
  );
}

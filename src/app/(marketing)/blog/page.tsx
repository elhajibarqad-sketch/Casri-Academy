import { BlogIndex, academyArticles, type BlogArticle } from "@/components/marketing/blog-index";
import { PageFrame } from "@/components/page-frame";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crypto Academy Blog | Casri Academy",
  description: "Educational articles on cryptocurrency, blockchain, market literacy, security, Web3, Forex, and risk management.",
};

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.ceil(words / 220))} min read`;
}

function inferCategory(text: string) {
  const value = text.toLowerCase();
  const checks = [
    ["Bitcoin", ["bitcoin", "btc"]],
    ["Ethereum", ["ethereum", "eth", "smart contract"]],
    ["DeFi", ["defi", "liquidity", "yield"]],
    ["Security", ["security", "wallet", "seed phrase", "phishing"]],
    ["Forex", ["forex", "fx", "currency"]],
    ["Technical Analysis", ["technical", "candlestick", "support", "resistance"]],
    ["Risk Management", ["risk", "position sizing", "drawdown"]],
    ["Blockchain", ["blockchain", "ledger", "consensus"]],
  ] as const;

  return checks.find(([, terms]) => terms.some((term) => value.includes(term)))?.[0] ?? "Cryptocurrency";
}

function imageFor(index: number) {
  const palette = ["0f172a,0891b2,67e8f9", "111827,7c3aed,c4b5fd", "0f172a,16a34a,86efac", "18181b,eab308,fef08a"];
  return `https://placehold.co/1200x760/${palette[index % palette.length]}.png?text=Casri+Academy+Article`;
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  const databaseArticles: BlogArticle[] = posts.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    summary: post.excerpt,
    category: inferCategory(`${post.title} ${post.excerpt} ${post.content}`),
    author: post.author,
    date: (post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: estimateReadTime(post.content),
    image: imageFor(index),
    featured: index === 0,
    popular: index < 3,
    source: "database",
  }));

  const articles = databaseArticles.length > 0 ? [...databaseArticles, ...academyArticles] : academyArticles;

  return (
    <PageFrame>
      <BlogIndex articles={articles} />
    </PageFrame>
  );
}

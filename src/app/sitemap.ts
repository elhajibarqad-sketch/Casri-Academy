import type { MetadataRoute } from "next";

const routes = ["/", "/courses", "/roadmap", "/live-market", "/blog", "/resources", "/glossary", "/faq", "/support", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const now = new Date();

  return routes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

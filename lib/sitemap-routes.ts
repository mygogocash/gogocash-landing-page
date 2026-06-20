import type { MetadataRoute } from "next";
import { learnArticleDateIso } from "@/lib/learn-article-dates";
import { getLearnArticles, learnArticlePathsAsync } from "@/lib/learn-data";
import { PARTNER_LANDING_PAGES } from "@/lib/partner-landing-pages";

export const SITE_CONTENT_LAST_MODIFIED = new Date("2026-06-20T00:00:00.000Z");

type SitemapEntry = MetadataRoute.Sitemap[number];

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function dateFromDisplay(display: string | undefined): Date | undefined {
  if (!display) return undefined;
  const iso = learnArticleDateIso(display);
  return iso ? new Date(`${iso}T00:00:00.000Z`) : undefined;
}

function routePriority(path: string): number {
  if (path === "") return 1;
  if (path.startsWith("/cashback/")) return 0.9;
  if (path.startsWith("/learn")) return 0.8;
  if (["/en", "/id", "/th", "/tw", "/cn", "/ja"].includes(path)) return 0.85;
  return 0.6;
}

function routeChangeFrequency(path: string): SitemapEntry["changeFrequency"] {
  if (path === "" || path.startsWith("/cashback/")) return "weekly";
  return path.startsWith("/learn") ? "monthly" : "monthly";
}

export async function buildSitemapEntries(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  const base = normalizeBaseUrl(baseUrl);
  const learnPaths = await learnArticlePathsAsync();
  const articles = await getLearnArticles();
  const articleDateByPath = new Map(
    articles.map((article) => [
      `/learn/${article.slug}`,
      dateFromDisplay(article.updated) ?? SITE_CONTENT_LAST_MODIFIED,
    ]),
  );

  const routes = [
    "",
    "/en",
    "/id",
    "/th",
    "/tw",
    "/cn",
    "/ja",
    "/learn",
    ...learnPaths,
    ...PARTNER_LANDING_PAGES.map((page) => `/cashback/${page.slug}`),
    "/privacy-policy",
    "/term-of-use",
    "/terms-of-service",
    "/how-gogocash-makes-money",
    "/search",
    "/about",
  ];

  return routes.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: articleDateByPath.get(path) ?? SITE_CONTENT_LAST_MODIFIED,
    changeFrequency: routeChangeFrequency(path),
    priority: routePriority(path),
  }));
}

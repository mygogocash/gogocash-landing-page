import type { MetadataRoute } from "next";
import { getLearnArticles } from "@/lib/learn-data";
import { learnArticleDateIso } from "@/lib/learn-article-dates";
import { PARTNER_LANDING_PAGES } from "@/lib/partner-landing-pages";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-static";

type SitemapRoute = {
  path: string;
  lastModified?: string;
};

const LEGAL_EFFECTIVE_DATE = "2026-07-15";

const STATIC_ROUTES: SitemapRoute[] = [
  { path: "" },
  { path: "/privacy-policy", lastModified: LEGAL_EFFECTIVE_DATE },
  { path: "/term-of-use", lastModified: LEGAL_EFFECTIVE_DATE },
  { path: "/how-gogocash-makes-money" },
  { path: "/search" },
  { path: "/about" },
  { path: "/id" },
  { path: "/th" },
  { path: "/tw" },
  { path: "/cn" },
  { path: "/ja" },
  { path: "/learn" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteOrigin();
  const learnArticles = await getLearnArticles();

  const routes: SitemapRoute[] = [
    ...STATIC_ROUTES,
    ...learnArticles.map((article) => ({
      path: `/learn/${article.slug}`,
      lastModified: learnArticleDateIso(article.updated),
    })),
    ...PARTNER_LANDING_PAGES.map((page) => ({
      path: `/cashback/${page.slug}`,
    })),
  ];

  return routes.map(({ path, lastModified }) => ({
    url: `${base}${path || "/"}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/learn") || path.startsWith("/cashback/")
          ? 0.8
          : 0.6,
  }));
}

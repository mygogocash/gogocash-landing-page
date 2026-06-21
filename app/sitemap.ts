import type { MetadataRoute } from "next";
import { learnArticlePathsAsync } from "@/lib/learn-data";
import { PARTNER_LANDING_PAGES } from "@/lib/partner-landing-pages";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteOrigin();
  const lastModified = new Date("2026-03-22");

  const learnPaths = await learnArticlePathsAsync();

  const routes = [
    "",
    "/en",
    "/privacy-policy",
    "/term-of-use",
    "/terms-of-service",
    "/how-gogocash-makes-money",
    "/search",
    "/about",
    "/id",
    "/th",
    "/tw",
    "/cn",
    "/ja",
    "/learn",
    ...learnPaths,
    ...PARTNER_LANDING_PAGES.map((page) => `/cashback/${page.slug}`),
  ];

  return routes.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/learn") || path.startsWith("/cashback/")
          ? 0.8
          : 0.6,
  }));
}

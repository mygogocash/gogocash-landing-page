import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/sitemap-routes";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries(siteOrigin());
}

/**
 * Verifies that the Strapi Learn CMS endpoint is reachable and returns the
 * fields required by the static landing build.
 *
 * Usage:
 *   STRAPI_URL=https://cms.example.com STRAPI_API_TOKEN=... npm run learn:cms-check
 *   STRAPI_URL=https://cms.example.com npm run learn:cms-check -- --require-published
 */

import {
  strapiBaseUrl,
  strapiHeaders,
} from "../lib/app-config";

const REQUIRED_FIELDS = [
  "slug",
  "title",
  "metaTitle",
  "metaDescription",
  "hubDesc",
  "content",
] as const;

function usage(): never {
  throw new Error(
    "STRAPI_URL is required. Example: STRAPI_URL=https://cms.example.com npm run learn:cms-check",
  );
}

function unwrapStrapiRow(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (
    "attributes" in r &&
    r.attributes &&
    typeof r.attributes === "object"
  ) {
    return { ...r, ...(r.attributes as Record<string, unknown>) };
  }
  return r;
}

function shortText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function main() {
  const base = strapiBaseUrl() ?? usage();
  const requirePublished = process.argv.includes("--require-published");
  const params = new URLSearchParams({
    "filters[publishedAt][$notNull]": "true",
    "pagination[page]": "1",
    "pagination[pageSize]": "1",
  });
  REQUIRED_FIELDS.forEach((field, index) => {
    params.set(`fields[${index}]`, field);
  });

  const url = `${base}/api/learn-articles?${params.toString()}`;
  const res = await fetch(url, {
    headers: strapiHeaders(),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Strapi rejected Learn CMS read (${res.status}). Enable public find/findOne for learn-articles or set STRAPI_API_TOKEN.`,
    );
  }
  if (res.status === 404) {
    throw new Error(
      "Strapi Learn collection not found. Create API ID plural `learn-articles` from cms/strapi/schema.json.",
    );
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Strapi Learn CMS check failed (${res.status}): ${body.slice(0, 500)}`,
    );
  }

  const json = (await res.json()) as { data?: unknown[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  if (rows.length === 0) {
    const message =
      "Strapi Learn CMS is reachable, but no published learn-articles were returned.";
    if (requirePublished) throw new Error(message);
    console.warn(`Warning: ${message}`);
    console.log("CMS endpoint OK.");
    return;
  }

  const first = unwrapStrapiRow(rows[0]);
  if (!first) throw new Error("Strapi returned an unreadable learn article row.");

  const missing = REQUIRED_FIELDS.filter((field) => !shortText(first[field]));
  if (missing.length > 0) {
    throw new Error(
      `First published Learn article is missing required field values: ${missing.join(", ")}`,
    );
  }

  console.log("CMS endpoint OK.");
  console.log(`Checked: ${base}/api/learn-articles`);
  console.log(`Sample article: ${shortText(first.title)} (${shortText(first.slug)})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

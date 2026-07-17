# Learn hub: local Markdown vs Strapi

The `/learn` hub and `/learn/[slug]` pages resolve article metadata and Markdown from **one of two sources**, chosen at **`next build`** (static export). This repository does not host or deploy a CMS: local Markdown is the production-safe default, while Strapi is an optional, externally managed content source.

## Local (default)

- **Metadata:** [`lib/learn-articles.ts`](../lib/learn-articles.ts) (`LEARN_ARTICLES`).
- **Body:** files under [`content/learn/`](../content/learn/) named `{slug}.md`, or bundled fallbacks in [`lib/learn-article-content.ts`](../lib/learn-article-content.ts).

No environment variables are required. CI builds use this path unless Strapi is configured.

## Externally managed Strapi (optional)

When **`STRAPI_URL`** is set (and the API returns at least one published entry), [`lib/learn-data.ts`](../lib/learn-data.ts) prefers:

1. **Index:** [`fetchStrapiLearnIndex`](../lib/strapi-learn.ts) for the hub and `generateStaticParams`.
2. **Per slug:** [`fetchStrapiLearnArticleBySlug`](../lib/strapi-learn.ts) for each article page.

If Strapi is unreachable or returns empty data, the build **falls back** to local `LEARN_ARTICLES` + `content/learn/*.md` without cluttering the build log. To print those diagnostics, set **`NODE_DEBUG=learn-data`** when running `next build` (Node `util.debuglog`).

Optional **`STRAPI_API_TOKEN`:** use for non-public Strapi permissions (build-time only; do not expose in client bundles).

Schema and field list: see the file header in [`lib/strapi-learn.ts`](../lib/strapi-learn.ts).

## CI / GitHub Actions

The production workflow ([`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml)) passes the optional `STRAPI_URL` repository variable and `STRAPI_API_TOKEN` secret only to the static build step. To build from an externally managed Strapi instance in CI:

1. Set repository variable `STRAPI_URL` to the external service URL.
2. If its content API is protected, set `STRAPI_API_TOKEN` as a repository or `landing-production` environment secret.

Leave both values unset to keep the deterministic local Markdown build. The retired Cloudflare-hosted CMS deployment path is intentionally not a fallback and must not be restored through the landing workflow.

## Pushing local Markdown to Strapi

For one-off or scripted uploads, use:

```bash
npm run learn:strapi-push
```

Script: [`scripts/push-learn-to-strapi.ts`](../scripts/push-learn-to-strapi.ts) (requires Strapi credentials / API access as documented there).

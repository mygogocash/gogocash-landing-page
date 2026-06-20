# Learn hub CMS

The `/learn` hub and `/learn/[slug]` pages resolve article metadata and Markdown from **one of two sources**, chosen at **`next build`** (static export).

The production-ready CMS path is **Strapi**. The checked-in collection schema
and setup notes live in [`cms/strapi/`](../cms/strapi/README.md).

## Local (default)

- **Metadata:** [`lib/learn-articles.ts`](../lib/learn-articles.ts) (`LEARN_ARTICLES`).
- **Body:** a `content/learn/{slug}.md` file if present, otherwise the bundled fallback `learnArticleMarkdownBySlug` in [`lib/learn-article-content.ts`](../lib/learn-article-content.ts). The `content/learn/` directory is optional and is **not** currently present in the repo, so article bodies ship from `lib/learn-article-content.ts` by default.

No environment variables are required. CI builds use this path unless Strapi is configured.

## Strapi CMS

When **`STRAPI_URL`** is set (and the API returns at least one published entry), [`lib/learn-data.ts`](../lib/learn-data.ts) prefers:

1. **Index:** [`fetchStrapiLearnIndex`](../lib/strapi-learn.ts) for the hub and `generateStaticParams`.
2. **Per slug:** [`fetchStrapiLearnArticleBySlug`](../lib/strapi-learn.ts) for each article page.

If Strapi is unreachable or returns empty data, the build **falls back** to local `LEARN_ARTICLES` + the bundled `lib/learn-article-content.ts` (or `content/learn/*.md` if you add that directory) without cluttering the build log. To print those diagnostics, set **`NODE_DEBUG=learn-data`** when running `next build` (Node `util.debuglog`).

Optional **`STRAPI_API_TOKEN`:** use for non-public Strapi permissions (build-time only; do not expose in client bundles).

CMS collection:

- Display name: `Learn Article`
- API ID singular: `learn-article`
- API ID plural: `learn-articles`
- Draft and publish: enabled
- Schema: [`cms/strapi/src/api/learn-article/content-types/learn-article/schema.json`](../cms/strapi/src/api/learn-article/content-types/learn-article/schema.json)

Required fields:

| Field | Type | Used by |
|-------|------|---------|
| `slug` | UID | `/learn/{slug}` static route |
| `title` | Text | H1 |
| `metaTitle` | Text | `<title>`, Open Graph, Twitter |
| `metaDescription` | Long text | Meta description and social cards |
| `hubDesc` | Long text | `/learn` article cards |
| `content` | Rich text Markdown | Article body |

Published entries are pulled into static HTML during `npm run build`; drafts are ignored.

## CMS health check

Use this before wiring CI or after changing Strapi permissions:

```bash
STRAPI_URL=https://cms.example.com STRAPI_API_TOKEN=... npm run learn:cms-check
```

If public `find` / `findOne` permissions are enabled for `learn-articles`, the
token can be omitted. To fail when the collection has no published entries:

```bash
STRAPI_URL=https://cms.example.com npm run learn:cms-check -- --require-published
```

## CI / GitHub Actions

The production, staging, and beta workflows pass optional CMS env into the
**Build static site** step. To build from Strapi in CI:

1. Add repository variable `STRAPI_URL`.
2. Add repository secret `STRAPI_API_TOKEN` if the Strapi collection is not public-read.
3. Push to the target branch or manually dispatch the workflow. The production,
   staging, and beta workflows already pass both values into `npm run build`.

Because this is a static export, publishing in Strapi is not enough by itself:
rebuild and redeploy the landing site after CMS edits.

## Pushing local Markdown to Strapi

For one-off or scripted uploads, use:

```bash
npm run learn:strapi-push
```

Script: [`scripts/push-learn-to-strapi.ts`](../scripts/push-learn-to-strapi.ts) (requires Strapi credentials / API access as documented there).

Recommended flow:

1. Run `DRY_RUN=1 STRAPI_URL=... STRAPI_PUSH_TOKEN=... npm run learn:strapi-push`.
2. Review the `[create]` / `[update]` output.
3. Run without `DRY_RUN`.
4. In Strapi, review and publish the entries.
5. Run `npm run learn:cms-check -- --require-published`.
6. Trigger the landing-page deploy.

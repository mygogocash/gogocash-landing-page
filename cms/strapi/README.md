# GoGoCash Learn CMS

This folder contains the Strapi collection blueprint for managing GoGoCash
Learn articles outside the landing-page codebase.

The landing site is still a static export. At `next build` time it reads
published CMS articles from `STRAPI_URL`; if the CMS is unavailable or empty,
it falls back to the local bundled Learn articles.

## Collection

Create one Strapi collection type:

- Display name: `Learn Article`
- Singular API ID: `learn-article`
- Plural API ID: `learn-articles`
- Draft and publish: enabled

The schema file is:

```txt
cms/strapi/src/api/learn-article/content-types/learn-article/schema.json
```

Copy that file into the same path in your Strapi app, or use it as the field
checklist when creating the collection from the Strapi admin UI.

## Fields

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `slug` | UID from `title` | Yes | URL segment for `/learn/{slug}` |
| `title` | Text | Yes | Article H1 |
| `metaTitle` | Text | Yes | SEO title |
| `metaDescription` | Long text | Yes | SEO description |
| `hubDesc` | Long text | Yes | Card description on `/learn` |
| `content` | Rich text | Yes | Markdown article body |

Publish entries before rebuilding the landing site. Drafts are ignored by the
landing build.

## Permissions

Use one of these access models:

1. Public read: enable `find` and `findOne` for `learn-articles`.
2. Build-token read: keep the collection private and set `STRAPI_API_TOKEN`
   in GitHub Secrets / local env.

For seeding from the repo, create a separate write token with create/update
access and set `STRAPI_PUSH_TOKEN`. Do not expose write tokens as public
`NEXT_PUBLIC_*` variables.

## Commands

Check CMS readiness:

```bash
STRAPI_URL=https://cms.example.com STRAPI_API_TOKEN=... npm run learn:cms-check
```

Seed or update the CMS from the bundled Learn articles:

```bash
STRAPI_URL=https://cms.example.com STRAPI_PUSH_TOKEN=... npm run learn:strapi-push
```

Preview write actions without changing Strapi:

```bash
DRY_RUN=1 STRAPI_URL=https://cms.example.com STRAPI_PUSH_TOKEN=... npm run learn:strapi-push
```

Rebuild the landing site after publishing CMS changes:

```bash
npm run build
```

# GoGoCash Learn CMS

This folder is a runnable Strapi CMS app for managing GoGoCash Learn articles.

The landing site is still a static export. At `next build` time it reads
published CMS articles from `STRAPI_URL`; if the CMS is unavailable or empty,
it falls back to the local bundled Learn articles.

## Local Admin

From the repository root:

```bash
npm run cms:env
npm run cms:install
npm run cms:dev
```

Open:

```txt
http://localhost:1337/admin
```

Create the first admin user when Strapi asks. Local `cms:dev` uses SQLite at
`cms/strapi/.tmp/data.db`.

Docker/Postgres option:

```bash
npm run cms:docker
```

That starts Strapi at `http://localhost:1337/admin` and Postgres on host port
`5433`.

## Collection

The app includes one Strapi collection type:

- Display name: `Learn Article`
- Singular API ID: `learn-article`
- Plural API ID: `learn-articles`
- Draft and publish: enabled

The schema file is:

```txt
src/api/learn-article/content-types/learn-article/schema.json
```

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

## Tokens and Permissions

Use one of these access models:

1. Public read: enable `find` and `findOne` for `learn-articles`.
2. Build-token read: keep the collection private and set `STRAPI_API_TOKEN`
   in GitHub Secrets / local env.

For seeding from the repo, create a separate write token with create/update
access and set `STRAPI_PUSH_TOKEN`. Do not expose write tokens as public
`NEXT_PUBLIC_*` variables.

Recommended token setup in Strapi Admin:

- `landing-build-read`: read-only token used by `STRAPI_API_TOKEN`.
- `local-seed-write`: write token used locally as `STRAPI_PUSH_TOKEN`.

## Commands

Check CMS readiness:

```bash
STRAPI_URL=https://cms.example.com STRAPI_API_TOKEN=... npm run learn:cms-check
```

For local Strapi:

```bash
STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=... npm run learn:cms-check
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

Preview the landing page from local CMS content:

```bash
STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=... npm run build
npm run dev
```

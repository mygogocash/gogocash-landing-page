# CMS Management

GoGoCash Learn content is managed with the Strapi app in
[`cms/strapi`](../cms/strapi/README.md). The landing site remains a static
Next.js export, so content changes become visible after a rebuild/deploy.

## Local Setup

```bash
npm run cms:env
npm run cms:install
npm run cms:dev
```

Open `http://localhost:1337/admin` and create the first Strapi admin user.

Docker/Postgres alternative:

```bash
npm run cms:docker
```

## First Content Load

1. In Strapi Admin, create a write API token with access to `learn-articles`.
2. Run a dry-run from the repository root:

```bash
DRY_RUN=1 STRAPI_URL=http://localhost:1337 STRAPI_PUSH_TOKEN=your_write_token npm run cms:seed
```

3. If the output looks right, run without `DRY_RUN=1`:

```bash
STRAPI_URL=http://localhost:1337 STRAPI_PUSH_TOKEN=your_write_token npm run cms:seed
```

4. Review and publish the entries in Strapi.

## Read Token for Landing Builds

Use either public read permissions or a read-only API token:

```bash
STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=your_read_token npm run learn:cms-check -- --require-published
```

For production GitHub builds:

- Repository variable: `STRAPI_URL`
- Repository secret: `STRAPI_API_TOKEN`

The production, staging, and beta workflows already pass those values to
`npm run build`.

## Publishing Flow

1. Edit or create a Learn Article in Strapi.
2. Publish the article.
3. Trigger a production landing rebuild/deploy.

Because this is static hosting, editing Strapi does not update `gogocash.co`
instantly. The site must rebuild so `/learn`, `/learn/{slug}`, sitemap, and
metadata are regenerated from the CMS.

## Local Preview from CMS

```bash
STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=your_read_token npm run build
npm run dev
```

Then open `http://localhost:3000/learn`.

## Safety Rules

- Do not commit `cms/strapi/.env`, SQLite DB files, uploads, or API tokens.
- Keep write tokens local and short-lived.
- Use read-only tokens for landing builds.
- Keep article slugs stable after publishing; changing a slug changes the URL.

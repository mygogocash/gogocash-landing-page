# Cloudflare Hosting for the Learn CMS

The GoGoCash Learn CMS is a Strapi Node.js application. It cannot run as a static Cloudflare Worker asset. The prepared Cloudflare path uses Cloudflare Containers for the Strapi process and an external managed PostgreSQL database for persistent content.

## Requirements

- Cloudflare Workers Paid plan with Containers enabled.
- Docker running on the machine or CI runner that executes `wrangler deploy`.
- Wrangler authentication through `CLOUDFLARE_API_TOKEN`.
- A managed PostgreSQL database URL.

Cloudflare Containers use ephemeral container disk, so do not rely on local SQLite or local uploads for production content. Keep Learn articles in PostgreSQL. Add an R2 upload provider before using Strapi media uploads in production.

## Secrets

Set these as environment variables before deploying, or as GitHub Actions secrets for the manual workflow:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
ENCRYPTION_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Local secret values can be generated with:

```bash
npm run cms:env -- --force
```

Copy values from `cms/strapi/.env` into the Cloudflare/GitHub secret store. Do not commit real secret values.

## Deploy

After Docker and Cloudflare auth are ready:

```bash
npm run cms:cloudflare:secrets
npm run cms:cloudflare:deploy
```

Check the Cloudflare container rollout:

```bash
npm run cms:cloudflare:status
```

The first deploy may take several minutes while Cloudflare builds and provisions the container image. The CMS will be reachable on the worker.dev URL for `gogocash-learn-cms` unless you add a custom domain.

## GitHub Actions

The manual workflow `.github/workflows/deploy-cms-cloudflare.yml` deploys the CMS container when all required secrets exist. Run it from GitHub Actions with **Deploy Learn CMS to Cloudflare**.

## Connect the Landing Build

After the CMS is live:

```bash
STRAPI_URL=https://<cms-worker-url>
STRAPI_API_TOKEN=<strapi-read-token>
```

Then validate:

```bash
STRAPI_URL=https://<cms-worker-url> STRAPI_API_TOKEN=<strapi-read-token> npm run learn:cms-check -- --require-published
```

# Deploy to Cloudflare Workers Static Assets

This site is a **Next.js static export** (`output: "export"`). The build writes
to `out/`, and Wrangler uploads that folder to Cloudflare Workers Static Assets.

| Environment | Worker name | Domain |
|-------------|-------------|--------|
| Production | `gogocash-landing-production` | `gogocash.co` |
| Staging | `gogocash-landing-staging` | `staging.gogocash.co` |
| Beta | `gogocash-landing-beta` | `beta.gogocash.co` |

## One-time setup

1. Create a Cloudflare API token with:
   - `Account -> Workers Scripts -> Edit`
   - `Zone -> Workers Routes -> Edit`
   - `Zone -> DNS -> Edit` if you will manage DNS during cutover
2. Add GitHub Actions variables:
   - `CLOUDFLARE_ACCOUNT_ID`
   - optional public build vars such as `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`
3. Add GitHub Actions secret:
   - `CLOUDFLARE_API_TOKEN`
4. Ensure the Cloudflare zone owns:
   - `gogocash.co`
   - `www.gogocash.co`
   - `staging.gogocash.co`
   - `beta.gogocash.co`

## Deploy locally

```bash
npm ci
npm run verify

npm run deploy:cloudflare:production
npm run deploy:cloudflare:staging
npm run deploy:cloudflare:beta
```

For local deploy testing, copy `.env.cloudflare.example` to `.env.cloudflare`
and export the variables before running Wrangler commands.

## Dry run

```bash
npm run deploy:cloudflare:dry-run
```

The dry run validates the Wrangler config and static asset upload plan without
publishing a new deployment.

## Routing and static behavior

Wrangler config files serve `./out` with:

- `html_handling: "drop-trailing-slash"` to match the prior clean URL behavior.
- `not_found_handling: "404-page"` so `out/404.html` is returned with a 404.
- `public/_headers` for immutable `/_next/static/*` cache headers.

Workers Static Assets `_redirects` does **not** support host-level redirects.
Configure `www.gogocash.co/* -> https://gogocash.co/:splat` as a Cloudflare
Redirect Rule or Bulk Redirect in the zone dashboard.

## Production smoke checks

```bash
curl -I https://gogocash.co/
curl -I https://gogocash.co/about
curl -I https://gogocash.co/sitemap.xml
curl -I https://gogocash.co/does-not-exist
curl -I https://www.gogocash.co/
```

Expected:

- main pages return `200`
- unknown pages return `404`
- `www` redirects to apex after the Cloudflare Redirect Rule is active
- `_next/static/*` responses include `Cache-Control: public,max-age=31536000,immutable`

## Rollback

Use Cloudflare Workers rollback from the Worker deployment history, or redeploy a
known-good commit with the same Wrangler config. During initial migration, keep
the previous Firebase release available until Cloudflare production smoke checks
pass.

Do not enable Cloudflare Cache Reserve or other paid caching features unless the
business owner explicitly approves the cost.

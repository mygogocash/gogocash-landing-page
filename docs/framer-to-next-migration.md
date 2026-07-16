# Framer to Next.js migration status

The migration is complete. The canonical site is a Next.js 16 static export
served by Cloudflare Worker `gogocash-landing-production` at `gogocash.co` and
`www.gogocash.co`.

## Current deployment model

1. `npm run verify` creates and validates `out/`.
2. Playwright runs against that static export.
3. `.github/workflows/deploy-production.yml` deploys the verified artifact with
   `wrangler.production.jsonc`.
4. Firebase Hosting remains staging-only at `gogocash-landing-staging`.

The production custom domains are declared in Wrangler. Do not point the apex
domain at Firebase or reintroduce the retired Firebase apex-DNS scripts.

## Preserved migration checks

- Keep redirects, canonical URLs, Open Graph data, JSON-LD, sitemap entries, and
  locale alternates aligned with the current App Router routes.
- Keep forms on an external provider because the production export has no Next.js
  API routes.
- Run `npm run verify` and `npm run test:e2e:static-only` before production deploys.
- Use Search Console and social-preview debuggers after URL or metadata changes.

For active runbooks, see the root `README.md`, `docs/firebase-deploy.md` for
staging, and `docs/posthog-reverse-proxy.md` for analytics proxying.

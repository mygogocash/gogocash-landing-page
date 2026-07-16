# Firebase Hosting (staging only)

GoGoCash production is the Cloudflare Worker `gogocash-landing-production`.
Firebase Hosting is retained only for the staging site and must not be connected
to `gogocash.co` or `www.gogocash.co`.

| Item | Value |
|------|-------|
| Firebase project | `landing-page-4ae23` |
| Hosting site | `gogocash-landing-staging` |
| Static root | `out/` |
| Workflow | `.github/workflows/deploy-staging.yml` |

## Local staging deploy

Use Node 26 and the repository-local Firebase CLI. The explicit `--force` flag
is temporarily required because TypeScript 7 exceeds TypeScript-ESLint's declared
`<6.1.0` peer range; it does not relax the verification gate:

```bash
npm ci --force
npm run verify
FIREBASE_HOSTING_SITES=gogocash-landing-staging npm run deploy:firebase
```

The build script runs the TypeScript 7 typecheck before Next’s static export.
Next and ESLint use scoped compatibility bridges only for their legacy Compiler
API integrations; they do not replace the TypeScript 7 acceptance gate.

Do not run `firebase init` or select Firebase App Hosting. This repository is a
Next.js static export and already has the correct classic Hosting configuration
in `firebase.json`.

`npm audit --omit=dev` is clean. The latest `firebase-tools` development tree
currently inherits GHSA-8988-4f7v-96qf through `@opentelemetry/core`. Track the
upstream fix; do not run `npm audit fix --force` or downgrade Firebase Tools.

## CI authentication

The staging workflow uses Google Workload Identity Federation through the
`FIREBASE_WIF_PROVIDER` and `FIREBASE_SA_EMAIL` repository variables. No service
account JSON key belongs in the repository.

## Verification and rollback

After deploy, verify the staging hostname, locale routes, static assets, and
analytics consent behavior. Roll back from Firebase Console Hosting releases or
redeploy a known-good commit. Production rollback is handled separately through
Cloudflare Worker deployments.

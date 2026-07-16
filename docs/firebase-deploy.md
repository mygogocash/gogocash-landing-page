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

Use Node 22 and the repository-local Firebase CLI:

```bash
npm ci
npm run verify
FIREBASE_HOSTING_SITES=gogocash-landing-staging npm run deploy:firebase
```

Do not run `firebase init` or select Firebase App Hosting. This repository is a
Next.js static export and already has the correct classic Hosting configuration
in `firebase.json`.

## CI authentication

The staging workflow uses Google Workload Identity Federation through the
`FIREBASE_WIF_PROVIDER` and `FIREBASE_SA_EMAIL` repository variables. No service
account JSON key belongs in the repository.

## Verification and rollback

After deploy, verify the staging hostname, locale routes, static assets, and
analytics consent behavior. Roll back from Firebase Console Hosting releases or
redeploy a known-good commit. Production rollback is handled separately through
Cloudflare Worker deployments.

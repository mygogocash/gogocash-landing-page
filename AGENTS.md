# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Static-export Next.js 16 marketing site for GoGoCash (cashback rewards). No backend, no database — purely static pages served from **Cloudflare Workers** in production (Worker `gogocash-landing-production`, config in `wrangler.production.jsonc`). Firebase Hosting is legacy/staging only. See `README.md` for full architecture and npm script reference.

### Node version

Requires **Node.js 22.x** (pinned in `.nvmrc`, `.node-version`, and `package.json` `engines`). Activate with `source ~/.nvm/nvm.sh && nvm use 22` if the default shell version differs.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm ci` |
| Dev server | `npm run dev` (Turbopack, port 3000) |
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Typecheck | `npm run typecheck` |
| Full gate | `npm run verify` (lint + test + typecheck + build) |
| Static build | `npm run build` (output in `out/`) |
| Production deploy | `npm run deploy:cloudflare` (build + `wrangler deploy`) |
| E2E tests | `npm run test:e2e` (requires dev server running; install browsers first with `npx playwright install --with-deps chromium webkit`) |

### Gotchas

- **E2E tests need a running dev server.** Start `npm run dev` in a separate terminal/tmux session before running `npm run test:e2e`. The Playwright config reuses the dev server on port 3000. Use `PLAYWRIGHT_SERVE_STATIC=1` (and `PORT` if 3000 is busy) to test against the static `out/` build.
- **Playwright browsers must be installed** with `npx playwright install --with-deps chromium webkit` on first setup. The `--with-deps` flag is essential on Linux to pull WebKit system libraries.
- **No environment variables are required** for local dev. All optional secrets (Involve Asia, Strapi, Firebase) fall back to sensible defaults. See `.env.example` for reference.
- **Tailwind CSS 4** uses the `@tailwindcss/postcss` adapter. If styles fail after dependency work, check `app/globals.css`, `postcss.config.mjs`, and `tailwind.config.ts`.
- **Static export only:** `next start` is not used in production. Always validate with `npm run build` since the live site is `output: "export"` static HTML.
- **Production deploy path:** `npm run deploy:cloudflare` — not Firebase. Run `npm run verify` before deploying.
- **Trailing-dot hostname:** `https://gogocash.co./` breaks relative asset URLs (Cloudflare 403). Use `publicAssetUrl()` for static assets; `app/layout.tsx` redirects trailing-dot hostnames to canonical `gogocash.co`.
- **Thailand locale defaults:** Worker `workers/production-geo-locale.ts` redirects `CF-IPCountry=TH` on `/` → `/th` unless `gogocash.locale` cookie has `lang=en` or UA is a bot. Client bootstrap also falls back to `Asia/Bangkok` timezone.

## Learned User Preferences

- Run `npm run verify` (lint, test, typecheck, build) before deploying to production.
- Deploy production with `npm run deploy:cloudflare` only after verify passes.
- When asked to fix console issues, scan the browser console (not just ESLint) and verify on both localhost and production URLs.
- Respect explicit English locale (`lang=en` in cookie/localStorage) — do not redirect those users to `/th`.

## Learned Workspace Facts

- Production is served by Cloudflare Worker `gogocash-landing-production`; `npm run deploy:cloudflare` is the production deploy path. `deploy:firebase` is legacy/staging only.
- Worker `workers/production-geo-locale.ts` geo-redirects Thailand visitors from `/` to `/th` unless `gogocash.locale` has `lang=en` or the user-agent looks like a bot.
- Client locale bootstrap uses browser language tags first, then `Asia/Bangkok` timezone fallback via `resolveThailandClientRedirect`.
- `persistLocale()` mirrors locale preference to `gogocash.locale` cookie (SameSite=Lax, ~1 year) for edge and client consistency.
- `https://gogocash.co./` (trailing dot) breaks relative `/images/...` URLs with Cloudflare 403; use `publicAssetUrl()` for static assets.
- E2E locale tests need explicit timezone mocks because machines in `Asia/Bangkok` otherwise skew redirect expectations.
- `PLAYWRIGHT_SERVE_STATIC=1` serves the static `out/` build for E2E; set `PORT` if 3000 is already in use.

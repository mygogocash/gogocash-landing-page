# PostHog reverse proxy (Cloudflare Worker)

Proxies `gogocash.co/ingest/*` → PostHog US cloud so analytics ingestion is
first-party and survives ad-blockers (~10–30% of `*.posthog.com` requests are
otherwise dropped). Independent of the Firebase deploy — it runs at Cloudflare's
edge on a route. Full rationale: [`docs/posthog-reverse-proxy.md`](../../docs/posthog-reverse-proxy.md).

## Deploy

```bash
cd infra/posthog-proxy
npm exec -- wrangler deploy  # needs a Cloudflare API token (Workers Scripts + Routes, gogocash.co zone)
```

## Activate (only AFTER the deploy verifies)

Set these GitHub Actions repo **variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://gogocash.co/ingest` |
| `NEXT_PUBLIC_POSTHOG_UI_HOST` | `https://us.posthog.com` |

The CI build env already forwards both (empty = direct to US cloud), so activation
is just setting the values, then redeploying the site.

## Verify

In DevTools → Network, confirm requests go to `gogocash.co/ingest/*` (not
`*.posthog.com`) and events land in PostHog → Activity.

> ⚠️ Don't set `NEXT_PUBLIC_POSTHOG_HOST` before this Worker is live, or every event 404s.

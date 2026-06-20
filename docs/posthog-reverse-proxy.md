# PostHog reverse proxy (beat ad-blockers)

Ad/tracker blockers drop ~10–30% of requests to `*.posthog.com`. Routing PostHog
through a **same-origin** path (`https://gogocash.co/ingest`) recovers most of that
data. The client is already proxy-ready:

```bash
NEXT_PUBLIC_POSTHOG_HOST=https://gogocash.co/ingest
NEXT_PUBLIC_POSTHOG_UI_HOST=https://us.posthog.com   # toolbar/links stay on the real host
```

`lib/posthog-client.ts` passes `api_host` (ingestion) and `ui_host` (app) accordingly.
**Only set `NEXT_PUBLIC_POSTHOG_HOST` to the proxy path AFTER the proxy is deployed**
— otherwise every event 404s.

PostHog US uses two upstreams: `us.i.posthog.com` (events/flags) and
`us-assets.i.posthog.com` (the `/static/*` recorder + array bundles).

---

## Cloudflare Worker

This site deploys to Cloudflare Workers Static Assets. Use a separate Cloudflare
Worker route for PostHog's official reverse proxy:

1. PostHog → **Settings → Project → Reverse proxy → Cloudflare**, copy the Worker.
2. Deploy it on a route like `gogocash.co/ingest/*`.
3. Set the two env vars above in the build env; redeploy the site.

Docs: https://posthog.com/docs/advanced/proxy/cloudflare

## Verify

With the proxy live + env set, load the site, accept cookies, and confirm requests go
to `gogocash.co/ingest/*` (not `*.posthog.com`) in DevTools → Network, and events land
in PostHog → Activity.

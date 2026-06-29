/**
 * PostHog same-origin reverse proxy (Cloudflare Worker).
 *
 * Route: gogocash.co/ingest/*  ->  PostHog US cloud, so ingestion is first-party
 * and survives ad/tracker blockers (~10-30% of *.posthog.com requests are blocked).
 *
 * Deploy:  cd infra/posthog-proxy && npx wrangler deploy
 *   (needs a Cloudflare API token with Workers Scripts + Routes on the gogocash.co zone)
 *
 * Then set, in the site build env (GitHub Actions repo variables):
 *   NEXT_PUBLIC_POSTHOG_HOST=https://gogocash.co/ingest
 *   NEXT_PUBLIC_POSTHOG_UI_HOST=https://us.posthog.com
 * Do NOT set the host var before this Worker is live, or every event 404s.
 * See docs/posthog-reverse-proxy.md.
 */
const API_HOST = "us.i.posthog.com"; // events, /flags, /decide, recordings
const ASSET_HOST = "us-assets.i.posthog.com"; // /static/* recorder + array bundles

export default {
  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/ingest/, "");
    const host = path.startsWith("/static/") ? ASSET_HOST : API_HOST;

    url.protocol = "https:";
    url.hostname = host;
    url.port = "";
    url.pathname = path;

    const proxied = new Request(url.toString(), request);
    proxied.headers.set("host", host);
    return fetch(proxied);
  },
};

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://d.line-scdn.net https://*.i.posthog.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.line-scdn.net https://tr.line.me https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://*.posthog.com https://*.i.posthog.com https://*.mixpanel.com https://*.googleapis.com",
  "frame-src 'self' https:",
  "upgrade-insecure-requests",
].join("; ");

const IMMUTABLE_ASSET_PREFIX = "/_next/static/";

/** Add version-controlled security and caching policy to a Worker response. */
export function withProductionHeaders(
  response: Response,
  pathname: string,
): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (headers.get("Content-Type")?.toLowerCase().includes("text/html")) {
    const cacheControl = headers.get("Cache-Control");
    const hasNoTransform = cacheControl
      ?.split(",")
      .some((directive) => directive.trim().toLowerCase() === "no-transform");

    // Cloudflare honors this standard directive by leaving the tested HTML
    // artifact unchanged instead of auto-injecting analytics outside consent.
    if (!hasNoTransform) {
      headers.set(
        "Cache-Control",
        cacheControl ? `${cacheControl}, no-transform` : "no-transform",
      );
    }
  }

  if (response.ok && pathname.startsWith(IMMUTABLE_ASSET_PREFIX)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

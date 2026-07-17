import { encodePublicPath } from "@/lib/encode-public-path";

/** Strip DNS root trailing dot so asset hosts match Cloudflare/Firebase canonical host. */
export function normalizeHostname(hostname: string): string {
  return hostname.replace(/\.$/, "");
}

/** Normalize an origin whose hostname may include a trailing dot (e.g. `https://gogocash.co.`). */
export function normalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    url.hostname = normalizeHostname(url.hostname);
    return url.origin;
  } catch {
    return origin.replace(/\/$/, "");
  }
}

function assetOriginForPublicPath(): string | null {
  if (typeof window !== "undefined") {
    if (window.location.hostname.endsWith(".")) {
      return normalizeOrigin(window.location.origin);
    }
  }
  return null;
}

/**
 * Root-relative paths break on hostnames with a trailing dot (`gogocash.co.`) because
 * `/images/...` resolves to `https://gogocash.co./images/...`, which Cloudflare blocks.
 * Static builds keep assets root-relative so previews, staging, and production all
 * test and serve their own artifact. The production Worker canonicalizes a
 * trailing-dot hostname before serving HTML; `app/layout.tsx` and the browser
 * fallback here cover hosts that bypass that edge route.
 */
export function publicAssetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  const encoded = encodePublicPath(path);
  const origin = assetOriginForPublicPath();
  return origin ? `${origin}${encoded}` : encoded;
}

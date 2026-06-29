import { marketingSiteOrigin } from "@/lib/app-config";
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
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return marketingSiteOrigin();
  }
  if (process.env.NODE_ENV === "development") {
    return null;
  }
  return marketingSiteOrigin();
}

/**
 * Root-relative paths break on hostnames with a trailing dot (`gogocash.co.`) because
 * `/images/...` resolves to `https://gogocash.co./images/...`, which Cloudflare blocks.
 * Production/static builds use the canonical marketing origin; local dev keeps relative paths.
 */
export function publicAssetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  const encoded = encodePublicPath(path);
  const origin = assetOriginForPublicPath();
  return origin ? `${origin}${encoded}` : encoded;
}

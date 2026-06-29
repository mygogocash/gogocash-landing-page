import {
  DEFAULT_LOCALE,
  isLangCode,
  isRegionCode,
  type StoredLocale,
} from "@/lib/locale-routing";

/** Mirrors `LOCALE_STORAGE_KEY` so edge and client share one preference shape. */
export const LOCALE_COOKIE_NAME = "gogocash.locale";

const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseLocaleCookie(cookieHeader: string | null): StoredLocale | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim();
    const eq = cookie.indexOf("=");
    if (eq === -1) continue;

    const name = cookie.slice(0, eq);
    if (name !== LOCALE_COOKIE_NAME) continue;

    try {
      const parsed = JSON.parse(decodeURIComponent(cookie.slice(eq + 1))) as Partial<
        StoredLocale
      >;
      if (!parsed.lang || !isLangCode(parsed.lang)) return null;
      return {
        lang: parsed.lang,
        region:
          parsed.region && isRegionCode(parsed.region)
            ? parsed.region
            : DEFAULT_LOCALE.region,
      };
    } catch {
      return null;
    }
  }

  return null;
}

/** Cookie name=value pair (attributes applied by persistLocale). */
export function formatLocaleCookie(locale: StoredLocale): string {
  return `${LOCALE_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(locale))}`;
}

/** Explicit English via locale menu should keep `/` even for Thailand signals. */
export function shouldSkipThailandDefaultRedirect(locale: StoredLocale | null): boolean {
  return locale?.lang === "en";
}

export function localeCookieAttributes(): string {
  return `Path=/; SameSite=Lax; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}`;
}

const DEFAULT_SITE_URL = "https://gogocash.co";

/** LINE Tag (LAP) — public id; override with NEXT_PUBLIC_LINE_TAG_ID or disable with empty string. */
const DEFAULT_LINE_TAG_ID = "d27ab1a2-5e67-48d0-af8d-ca6b30b67452";

const LINE_TAG_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_PUBLIC_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDrxKfICfS512IFSjfPomoFZSwy-D-vPZI",
  authDomain: "landing-page-4ae23.firebaseapp.com",
  projectId: "landing-page-4ae23",
  storageBucket: "landing-page-4ae23.firebasestorage.app",
  messagingSenderId: "110817639529",
  appId: "1:110817639529:web:7aa0d7da755797ecac76f8",
  measurementId: "G-847C4M51SE",
} as const;

export type PublicFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

function readTrimmedEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readTrimmedValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function readPublicIntegrationIdValue(
  raw: string | undefined,
  fallback: string,
): string | null {
  if (raw !== undefined && raw.trim() === "") return null;
  const value = raw?.trim() ?? fallback;
  return /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : null;
}

function firstValidUrl(candidates: Array<string | null>): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate).toString();
    } catch {
      /* try next candidate */
    }
  }
  return DEFAULT_SITE_URL;
}

function firstValidOptionalUrl(candidates: Array<string | null>): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate).toString();
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

export function marketingSiteUrl(): string {
  const vercelUrl = readTrimmedEnv("VERCEL_URL");
  return firstValidUrl([
    readTrimmedValue(process.env.NEXT_PUBLIC_SITE_URL),
    vercelUrl ? `https://${vercelUrl}` : null,
  ]);
}

export function marketingMetadataBase(): URL {
  return new URL(marketingSiteUrl());
}

export function marketingSiteOrigin(): string {
  return marketingMetadataBase().origin;
}

export function isMarketingAnalyticsEnabled(): boolean {
  const override = readTrimmedValue(
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
  );
  if (override === "false") return false;
  if (override === "true") return true;
  return process.env.NODE_ENV === "production";
}

/**
 * LINE Tag id for base + conversion snippets. Returns null if explicitly disabled
 * (`NEXT_PUBLIC_LINE_TAG_ID=`) or if the value is not a UUID-shaped id.
 */
export function publicLineTagId(): string | null {
  const raw = process.env.NEXT_PUBLIC_LINE_TAG_ID;
  if (raw !== undefined && raw.trim() === "") return null;
  const fromEnv = readTrimmedValue(process.env.NEXT_PUBLIC_LINE_TAG_ID);
  const candidate = (fromEnv ?? DEFAULT_LINE_TAG_ID).trim();
  return LINE_TAG_UUID.test(candidate) ? candidate : null;
}

/**
 * Load LINE Tag when an id is configured and either marketing analytics is on
 * or `NEXT_PUBLIC_LINE_TAG_ENABLED=true`. Force off with `false`.
 */
export function shouldLoadLineTag(): boolean {
  if (!publicLineTagId()) return false;
  const lineOverride = readTrimmedValue(
    process.env.NEXT_PUBLIC_LINE_TAG_ENABLED,
  );
  if (lineOverride === "false") return false;
  if (lineOverride === "true") return true;
  return isMarketingAnalyticsEnabled();
}

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * PostHog project key (publishable). No default — PostHog stays off until set.
 * Read via STATIC `process.env.NEXT_PUBLIC_*` so Next inlines it into the client
 * bundle. Every public value consumed in browser code follows the same rule;
 * computed `process.env[name]` access is reserved for server-only secrets.
 */
export function publicPostHogKey(): string | null {
  const value = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  return value ? value : null;
}

/**
 * PostHog ingestion host; defaults to US cloud. Point this at a same-origin
 * reverse proxy (e.g. `https://gogocash.co/ingest`) to dodge ad-blockers —
 * see docs/posthog-reverse-proxy.md.
 */
export function publicPostHogHost(): string {
  const value = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  return value ? value : DEFAULT_POSTHOG_HOST;
}

/** PostHog UI/app host (toolbar, links). Stays the real cloud host when proxying. */
export function publicPostHogUiHost(): string {
  const value = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST?.trim();
  return value ? value : "https://us.posthog.com";
}

/**
 * Load PostHog when a key is configured and either marketing analytics is on or
 * `NEXT_PUBLIC_POSTHOG_ENABLED=true`. Force off with `false`. Runtime capture is
 * additionally gated on cookie consent (see `lib/posthog-client.ts`).
 */
export function shouldLoadPostHog(): boolean {
  if (!publicPostHogKey()) return false;
  const override = process.env.NEXT_PUBLIC_POSTHOG_ENABLED?.trim();
  if (override === "false") return false;
  if (override === "true") return true;
  return isMarketingAnalyticsEnabled();
}

/**
 * Mixpanel project token (publishable, client-side ingestion id — not a secret,
 * same category as the Firebase web apiKey or LINE Tag id). The provided default
 * makes tracking work out of the box; override per environment with
 * `NEXT_PUBLIC_MIXPANEL_TOKEN`, or set it to an empty string to disable Mixpanel.
 */
const DEFAULT_MIXPANEL_TOKEN = "d97bbf4f9cd7512b562b6f0ddc723c4b";

export function publicMixpanelToken(): string | null {
  return readPublicIntegrationIdValue(
    process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    DEFAULT_MIXPANEL_TOKEN,
  );
}

/**
 * Optional Mixpanel ingestion host for data residency (e.g.
 * `https://api-eu.mixpanel.com`). Defaults to Mixpanel US cloud when unset.
 */
export function publicMixpanelApiHost(): string | null {
  const url = firstValidOptionalUrl([
    readTrimmedValue(process.env.NEXT_PUBLIC_MIXPANEL_API_HOST),
  ]);
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * Load Mixpanel when a token is configured and either marketing analytics is on
 * or `NEXT_PUBLIC_MIXPANEL_ENABLED=true`. Force off with `false`. Runtime capture
 * is additionally gated on cookie consent (see `lib/mixpanel-client.ts`).
 */
export function shouldLoadMixpanel(): boolean {
  if (!publicMixpanelToken()) return false;
  const override = readTrimmedValue(process.env.NEXT_PUBLIC_MIXPANEL_ENABLED);
  if (override === "false") return false;
  if (override === "true") return true;
  return isMarketingAnalyticsEnabled();
}

export function publicFirebaseMeasurementId(): string {
  return (
    readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) ??
    DEFAULT_PUBLIC_FIREBASE_CONFIG.measurementId
  );
}

export function publicFirebaseConfig(): PublicFirebaseConfig | null {
  const apiKey =
    readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) ??
    DEFAULT_PUBLIC_FIREBASE_CONFIG.apiKey;
  if (!apiKey) return null;

  return {
    apiKey,
    authDomain:
      readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.authDomain,
    projectId:
      readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.projectId,
    storageBucket:
      readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.messagingSenderId,
    appId:
      readTrimmedValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.appId,
    measurementId: publicFirebaseMeasurementId(),
  };
}

export function strapiBaseUrl(): string | null {
  const raw = readTrimmedEnv("STRAPI_URL");
  return raw ? raw.replace(/\/$/, "") : null;
}

export function strapiHeaders(): HeadersInit {
  const token = readTrimmedEnv("STRAPI_API_TOKEN");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function involveAsiaConfig(): {
  key: string | null;
  secret: string | null;
  maxOfferPages: number;
} {
  return {
    key: readTrimmedEnv("INVOLVE_ASIA_API_KEY"),
    secret: readTrimmedEnv("INVOLVE_ASIA_API_SECRET"),
    maxOfferPages: Math.min(
      50,
      Math.max(
        1,
        Number(readTrimmedEnv("INVOLVE_ASIA_MAX_OFFER_PAGES") ?? "5") || 5,
      ),
    ),
  };
}

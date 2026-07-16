/**
 * Cookie consent state (issue #7 — PDPA/GDPR). Category preferences gate
 * optional trackers: analytics (Firebase, PostHog, Mixpanel) and marketing (LINE Tag).
 * Client-only (static export has no server to enforce consent). Mirrors the
 * storage + CustomEvent pattern in `lib/locale-storage.ts`.
 */
export const COOKIE_CONSENT_KEY = "gogocash.cookie_consent";

/** Dispatched after a decision is persisted; trackers re-evaluate on this. */
export const COOKIE_CONSENT_EVENT = "gogocash:cookie-consent";

/** Dispatched by the "Cookie Settings" footer link to re-open the banner. */
export const COOKIE_CONSENT_OPEN_EVENT = "gogocash:cookie-consent-open";

/** Bump to re-prompt everyone when the cookie categories materially change. */
export const COOKIE_CONSENT_VERSION = 2;

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

export const DEFAULT_COOKIE_PREFERENCES: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
};

export const ALL_COOKIE_PREFERENCES: CookieConsentPreferences = {
  analytics: true,
  marketing: true,
};

export type CookieConsent = {
  version: number;
  preferences: CookieConsentPreferences;
  decidedAt: string;
};

/**
 * Browsers and embedded webviews can deny localStorage entirely. Tie the
 * fallback to the current Window so a decision still lasts for this tab while
 * tests (and future browsing contexts) cannot inherit another window's state.
 */
let sessionConsent: { owner: object; value: CookieConsent } | null = null;

function parsePreferences(
  value: unknown,
): CookieConsentPreferences | null {
  if (!value || typeof value !== "object") return null;
  const maybe = value as Partial<CookieConsentPreferences>;
  if (typeof maybe.analytics !== "boolean") return null;
  if (typeof maybe.marketing !== "boolean") return null;
  return {
    analytics: maybe.analytics,
    marketing: maybe.marketing,
  };
}

function preferencesFromDecision(
  value: boolean | CookieConsentPreferences,
): CookieConsentPreferences {
  if (typeof value === "boolean") {
    return value ? { ...ALL_COOKIE_PREFERENCES } : { ...DEFAULT_COOKIE_PREFERENCES };
  }
  return {
    analytics: value.analytics,
    marketing: value.marketing,
  };
}

/** Pure: validate a stored raw string into consent, or null if undecided/invalid/stale. */
export function parseConsent(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    const preferences = parsePreferences(parsed.preferences);
    if (!preferences) return null;
    return {
      version: COOKIE_CONSENT_VERSION,
      preferences,
      decidedAt:
        typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
    };
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const fallback =
    sessionConsent?.owner === window ? sessionConsent.value : null;
  try {
    return (
      parseConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY)) ?? fallback
    );
  } catch {
    return fallback;
  }
}

/** Has the visitor made a choice yet? When false, show the banner. */
export function hasDecidedConsent(): boolean {
  return readConsent() !== null;
}

/**
 * May non-essential trackers run? Opt-in: false unless the visitor explicitly
 * accepted. Undecided and rejected both return false.
 */
export function isAnalyticsAllowed(): boolean {
  return readConsent()?.preferences.analytics === true;
}

/** May marketing pixels run? Opt-in: false unless explicitly enabled. */
export function isMarketingAllowed(): boolean {
  return readConsent()?.preferences.marketing === true;
}

/** Persist a decision and notify trackers/UI. */
export function persistConsent(
  preferencesOrAccepted: boolean | CookieConsentPreferences,
): void {
  if (typeof window === "undefined") return;
  const preferences = preferencesFromDecision(preferencesOrAccepted);
  const value: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    preferences,
    decidedAt: new Date().toISOString(),
  };
  sessionConsent = { owner: window, value };
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked (private mode) — decision applies for this session only */
  }
  window.dispatchEvent(
    new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: value }),
  );
}

/** Re-open consent and retain the invoking control for focus restoration. */
export function openCookiePreferences(trigger?: HTMLElement): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<HTMLElement | null>(COOKIE_CONSENT_OPEN_EVENT, {
      detail: trigger ?? null,
    }),
  );
}

import type { Analytics } from "firebase/analytics";
import {
  isMarketingAnalyticsEnabled,
  publicFirebaseConfig,
} from "@/lib/app-config";
import { isAnalyticsAllowed } from "@/lib/cookie-consent";
import { googleConsentSettingsForPreferences } from "@/lib/google-consent-mode";
import { posthogCapture } from "@/lib/posthog-client";
import { mixpanelCapture, mixpanelRegister } from "@/lib/mixpanel-client";

type FirebaseAnalyticsSdk = typeof import("firebase/analytics");

const GOGOCASH_COOKIE_DOMAIN = "gogocash.co";
const GA_COOKIE_NAMES = new Set(["_ga", "_gid", "_gat", "_gcl_au"]);

let analyticsClient: Analytics | null = null;
let analyticsSdk: FirebaseAnalyticsSdk | null = null;
let analyticsInitialization: Promise<Analytics | null> | null = null;

function firebaseAnalyticsAllowed(): boolean {
  return isMarketingAnalyticsEnabled() && isAnalyticsAllowed();
}

function logFirebaseDebug(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[firebase-analytics] ${context}:`, err);
  }
}

function isGoogleAnalyticsCookie(name: string): boolean {
  return (
    GA_COOKIE_NAMES.has(name) ||
    name.startsWith("_ga_") ||
    name.startsWith("_gat_") ||
    name.startsWith("_gac_")
  );
}

function accessibleCookieDomains(): string[] {
  const hostname = window.location.hostname.replace(/\.$/, "").toLowerCase();
  const domains = new Set<string>();
  if (hostname) domains.add(hostname);
  if (
    hostname === GOGOCASH_COOKIE_DOMAIN ||
    hostname.endsWith(`.${GOGOCASH_COOKIE_DOMAIN}`)
  ) {
    domains.add(GOGOCASH_COOKIE_DOMAIN);
  }
  return [...domains];
}

/** Remove every GA identifier that client-side JavaScript is allowed to see. */
function clearAccessibleGoogleAnalyticsCookies(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  let names: string[];
  try {
    names = document.cookie
      .split(";")
      .map((part) => part.slice(0, part.indexOf("=")).trim())
      .filter((name) => name && isGoogleAnalyticsCookie(name));
  } catch {
    return;
  }

  const expires = "Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/";
  for (const name of new Set(names)) {
    try {
      // Host-only cookie.
      document.cookie = `${name}=; ${expires}`;
      // GA commonly uses an auto-selected parent domain. Try every domain this
      // page can legally overwrite; inaccessible third-party cookies remain the
      // provider's responsibility.
      for (const domain of accessibleCookieDomains()) {
        document.cookie = `${name}=; ${expires}; Domain=${domain}`;
      }
    } catch {
      /* cookies blocked — there is nothing accessible to clear */
    }
  }
}

function setFirebaseCollectionEnabled(enabled: boolean): void {
  if (!analyticsClient || !analyticsSdk) return;
  try {
    analyticsSdk.setAnalyticsCollectionEnabled(analyticsClient, enabled);
  } catch (err) {
    logFirebaseDebug("collection state update failed", err);
  }
}

function currentGoogleConsentSettings() {
  return googleConsentSettingsForPreferences(
    isAnalyticsAllowed(),
  );
}

function syncGoogleConsentMode(): void {
  if (!analyticsSdk) return;
  try {
    analyticsSdk.setConsent(currentGoogleConsentSettings());
  } catch (err) {
    logFirebaseDebug("Google consent update failed", err);
  }
}

async function initializeFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !firebaseAnalyticsAllowed()) return null;
  const config = publicFirebaseConfig();
  if (!config?.projectId) return null;

  try {
    const [firebaseApp, firebaseAnalytics] = await Promise.all([
      import("firebase/app"),
      import("firebase/analytics"),
    ]);
    if (!firebaseAnalyticsAllowed()) return null;
    if (!(await firebaseAnalytics.isSupported())) return null;
    if (!firebaseAnalyticsAllowed()) return null;

    analyticsSdk = firebaseAnalytics;
    // Establish denied-by-default ad consent before Firebase creates gtag or
    // sends its first request. The SDK preserves this until initialization.
    syncGoogleConsentMode();
    const app = firebaseApp.getApps()[0] ?? firebaseApp.initializeApp(config);
    analyticsClient = firebaseAnalytics.getAnalytics(app);
    return analyticsClient;
  } catch (err) {
    logFirebaseDebug("init failed", err);
    return null;
  }
}

function ensureFirebaseAnalytics(): Promise<Analytics | null> {
  if (analyticsClient) return Promise.resolve(analyticsClient);
  if (analyticsInitialization) return analyticsInitialization;

  const pending = initializeFirebaseAnalytics();
  analyticsInitialization = pending;
  void pending.finally(() => {
    if (analyticsInitialization === pending) analyticsInitialization = null;
  });
  return pending;
}

/**
 * Reconcile Firebase/GA4 with the latest consent decision. This intentionally
 * awaits an in-flight initializer and checks consent again afterwards so a slow
 * SDK import cannot turn collection back on after withdrawal.
 */
export async function syncFirebaseAnalyticsConsent(): Promise<void> {
  syncGoogleConsentMode();
  if (!firebaseAnalyticsAllowed()) {
    setFirebaseCollectionEnabled(false);
    clearAccessibleGoogleAnalyticsCookies();
    return;
  }

  const analytics = await ensureFirebaseAnalytics();
  if (!analytics) {
    if (!firebaseAnalyticsAllowed()) clearAccessibleGoogleAnalyticsCookies();
    return;
  }

  const enabled = firebaseAnalyticsAllowed();
  syncGoogleConsentMode();
  setFirebaseCollectionEnabled(enabled);
  if (!enabled) clearAccessibleGoogleAnalyticsCookies();
}

/** Fire a GA4 event when Firebase analytics is available (consent-gated). */
function logFirebase(name: string, params?: Record<string, unknown>): void {
  if (!analyticsClient || !analyticsSdk || !firebaseAnalyticsAllowed()) return;
  try {
    analyticsSdk.logEvent(analyticsClient, name, params);
  } catch {
    /* SDK not ready */
  }
}

/** SPA / client navigations — skip duplicating the first load (SDK handles initial hit). */
export function logPageView(pagePath: string): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  logFirebase("page_view", {
    page_path: pagePath.startsWith("/") ? pagePath : `/${pagePath}`,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/** Site search page (`/search?q=`) — GA4 recommended `search` event + PostHog. */
export function logSiteSearch(searchTerm: string): void {
  const term = searchTerm.trim();
  if (!term) return;
  logFirebase("search", { search_term: term });
  posthogCapture("site_search", { query: term });
  mixpanelCapture("search_submitted", { query: term });
}

export function logLocaleLanguageSelect(lang: string): void {
  logFirebase("select_content", {
    content_type: "locale_language",
    item_id: lang,
  });
  posthogCapture("locale_language_selected", { lang });
  mixpanelCapture("locale_changed", { type: "language", language: lang });
  mixpanelRegister({ locale_lang: lang });
}

export function logLocaleRegionSelect(region: string): void {
  logFirebase("select_content", {
    content_type: "locale_region",
    item_id: region,
  });
  posthogCapture("locale_region_selected", { region });
  mixpanelCapture("locale_changed", { type: "region", region });
  mixpanelRegister({ locale_region: region });
}

/**
 * Primary "launch app" CTA. `destination` is the resolved target (web on desktop,
 * LINE on mobile); `placement` is where on the page it was clicked (hero, final,
 * feature, header, quests) — powering CTA-performance breakdowns in PostHog.
 */
export function logLaunchAppClick(
  destination: "web_desktop" | "line_mobile",
  placement = "unknown",
): void {
  logFirebase("select_content", {
    content_type: "cta_launch_app",
    item_id: destination,
  });
  posthogCapture("cta_clicked", { destination, placement });
  mixpanelCapture("app_launched", { destination, surface: placement });
}

export function logBrandsLoadMore(
  visibleCount: number,
  totalBrands: number,
): void {
  logFirebase("select_content", {
    content_type: "brands_load_more",
    item_id: `${visibleCount}_of_${totalBrands}`,
  });
  posthogCapture("brands_load_more", {
    visible: visibleCount,
    total: totalBrands,
  });
  mixpanelCapture("brands_load_more", {
    visible: visibleCount,
    total: totalBrands,
  });
}

// --- Engagement events (PostHog-focused; drive scroll-depth + content interest) ---

/** A FAQ question was expanded. */
export function logFaqOpen(question: string): void {
  posthogCapture("faq_opened", { question });
  mixpanelCapture("faq_opened", { question });
}

/** A "How it works" tab was selected. */
export function logHowItWorksTab(step: number, label: string): void {
  posthogCapture("how_it_works_tab", { step, label });
  mixpanelCapture("how_it_works_tab_selected", { step, label });
}

/** A page section first scrolled into view (once per section). */
export function logSectionView(section: string): void {
  posthogCapture("section_viewed", { section });
  mixpanelCapture("section_viewed", { section });
}

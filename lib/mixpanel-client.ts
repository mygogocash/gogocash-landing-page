import type mixpanelBrowser from "mixpanel-browser";
import {
  publicMixpanelApiHost,
  publicMixpanelToken,
  shouldLoadMixpanel,
} from "@/lib/app-config";
import { isAnalyticsAllowed } from "@/lib/cookie-consent";
import { resolveLocaleForPathname } from "@/lib/locale-routing";

type MixpanelInstance = typeof mixpanelBrowser;

let client: MixpanelInstance | null = null;
let initializing = false;

/** First-touch attribution params, registered once per identity. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Mixpanel may capture only when configured/enabled AND cookie consent is granted. */
export function mixpanelAllowed(): boolean {
  return shouldLoadMixpanel() && isAnalyticsAllowed();
}

function deviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
}

/** locale_lang / locale_region derived from the current path (lib/locale-routing). */
function localeSuperProps(): Record<string, string> {
  const locale = resolveLocaleForPathname(window.location.pathname);
  return locale
    ? { locale_lang: locale.lang, locale_region: locale.region }
    : {};
}

/** First-touch attribution: UTM params + referrer domain (registered once). */
function attributionSuperProps(): Record<string, string> {
  const props: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) props[key] = value;
  }
  if (document.referrer) {
    try {
      props.referrer_domain = new URL(document.referrer).hostname;
    } catch {
      /* malformed referrer — skip */
    }
  }
  return props;
}

/**
 * Load + init mixpanel-browser once, after consent. The SDK is dynamically
 * imported so it never enters the initial bundle and never runs before the
 * visitor accepts. Mirrors `lib/posthog-client.ts`.
 */
async function initMixpanel(): Promise<void> {
  if (typeof window === "undefined" || client || initializing) return;
  const token = publicMixpanelToken();
  if (!token) return;
  initializing = true;
  try {
    const { default: mixpanel } = await import("mixpanel-browser");
    // Consent can be withdrawn while the SDK chunk is in flight. Do not even
    // initialize its persistence layer unless the latest decision still allows it.
    if (!mixpanelAllowed()) return;
    const config: NonNullable<Parameters<typeof mixpanel.init>[1]> = {
      // Consent-first: ship no events until the visitor opts in (#7 / PDPA).
      opt_out_tracking_by_default: true,
      // SPA pageviews are fired manually on App Router route changes.
      track_pageview: false,
      // Cookie persistence (cross_subdomain_cookie defaults true) shares the
      // distinct_id across gogocash.co <-> app.gogocash.co, so a landing visitor
      // and their later app signup resolve to one Mixpanel user.
      persistence: "cookie",
      cross_subdomain_cookie: true,
      debug: process.env.NODE_ENV !== "production",
    };
    const apiHost = publicMixpanelApiHost();
    if (apiHost) config.api_host = apiHost;
    mixpanel.init(token, config);
    client = mixpanel;
    // We only reach init once consent is granted (see syncMixpanelConsent).
    // A persisted opt-in survives reloads, so only emit the one-time $opt_in
    // event on the genuine first opt-in — not on every page load.
    if (!mixpanel.has_opted_in_tracking()) mixpanel.opt_in_tracking();
    mixpanel.register({
      platform: "web",
      device_type: deviceType(),
      ...localeSuperProps(),
    });
    const attribution = attributionSuperProps();
    if (Object.keys(attribution).length > 0) {
      mixpanel.register_once(attribution); // first-touch — never overwritten
    }
    // Capture the page the visitor is on at init (route listener handles the rest).
    mixpanelCapturePageView(
      `${window.location.pathname}${window.location.search}`,
    );
  } catch {
    /* SDK failed to load — analytics simply stays off */
  } finally {
    initializing = false;
  }
}

/**
 * Reconcile Mixpanel with the current consent decision: init or opt back in on
 * grant, opt out + reset on revoke. Safe to call repeatedly.
 */
export async function syncMixpanelConsent(): Promise<void> {
  if (mixpanelAllowed()) {
    if (client) client.opt_in_tracking();
    else await initMixpanel();
  } else if (client) {
    client.opt_out_tracking();
    client.reset();
  }
}

/** Manual SPA pageview for App Router route changes. */
export function mixpanelCapturePageView(path: string): void {
  if (!client || !mixpanelAllowed()) return;
  try {
    client.track("page_viewed", {
      path,
      url: window.location.href,
    });
  } catch {
    /* noop */
  }
}

/**
 * Capture a custom event, gated on config + consent. Safe before init (no-op).
 * Use `object_verb` snake_case names (e.g. "app_launched", "partner_clicked").
 */
export function mixpanelCapture(
  event: string,
  props?: Record<string, unknown>,
): void {
  if (!client || !mixpanelAllowed()) return;
  try {
    client.track(event, props);
  } catch {
    /* noop */
  }
}

/**
 * Update super properties on every subsequent event (e.g. locale after a
 * language/region switch). No-op before init / without consent.
 */
export function mixpanelRegister(props: Record<string, unknown>): void {
  if (!client || !mixpanelAllowed()) return;
  try {
    client.register(props);
  } catch {
    /* noop */
  }
}

/**
 * Current Mixpanel distinct_id, for cross-domain handoff to the LINE mini app
 * via a URL param (`mp_distinct_id`). Cookie persistence already shares it with
 * the app.gogocash.co subdomain. Null before init / without consent.
 */
export function mixpanelDistinctId(): string | null {
  if (!client || !mixpanelAllowed()) return null;
  try {
    return client.get_distinct_id() ?? null;
  } catch {
    return null;
  }
}

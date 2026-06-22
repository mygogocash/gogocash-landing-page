import type mixpanelBrowser from "mixpanel-browser";
import {
  publicMixpanelApiHost,
  publicMixpanelToken,
  shouldLoadMixpanel,
} from "@/lib/app-config";
import { isAnalyticsAllowed } from "@/lib/cookie-consent";

type MixpanelInstance = typeof mixpanelBrowser;

let client: MixpanelInstance | null = null;
let initializing = false;

/** Mixpanel may capture only when configured/enabled AND cookie consent is granted. */
export function mixpanelAllowed(): boolean {
  return shouldLoadMixpanel() && isAnalyticsAllowed();
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
    const config: NonNullable<Parameters<typeof mixpanel.init>[1]> = {
      // Consent-first: ship no events until the visitor opts in (#7 / PDPA).
      opt_out_tracking_by_default: true,
      // SPA pageviews are fired manually on App Router route changes.
      track_pageview: false,
      persistence: "localStorage",
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
    mixpanel.register({ platform: "web" });
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

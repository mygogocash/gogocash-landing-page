import { type PostHog } from "posthog-js";
import {
  publicPostHogHost,
  publicPostHogKey,
  publicPostHogUiHost,
  shouldLoadPostHog,
} from "@/lib/app-config";
import { isAnalyticsAllowed } from "@/lib/cookie-consent";
import { resolveLocaleForPathname } from "@/lib/locale-routing";

let client: PostHog | null = null;
let initializing = false;

function logPostHogDebug(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[posthog] ${context}:`, err);
  }
}

/** PostHog may capture only when configured/enabled AND cookie consent is granted. */
export function posthogAllowed(): boolean {
  return shouldLoadPostHog() && isAnalyticsAllowed();
}

/**
 * locale_lang / locale_region super properties from the current path. PostHog
 * auto-captures device/browser/UTM, but not the app's locale — register it so
 * every event can be broken down by language/region.
 */
function localeSuperProps(): Record<string, string> {
  const locale = resolveLocaleForPathname(window.location.pathname);
  return locale
    ? { locale_lang: locale.lang, locale_region: locale.region }
    : {};
}

/**
 * Load + init posthog-js once, after consent. The SDK is dynamically imported so
 * it never enters the initial bundle and never runs before the visitor accepts.
 */
async function initPostHog(): Promise<void> {
  if (typeof window === "undefined" || client || initializing) return;
  const key = publicPostHogKey();
  if (!key) return;
  initializing = true;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(key, {
      api_host: publicPostHogHost(),
      ui_host: publicPostHogUiHost(), // correct toolbar/links when proxied
      capture_pageview: false, // SPA pageviews fired manually (App Router)
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ["click"],
        element_allowlist: ["a", "button"],
        css_selector_allowlist: ["[data-ph-capture]"],
      },
      enable_heatmaps: true, // clickmaps for the landing page
      capture_exceptions: true, // error tracking: unhandled errors + promise rejections
      capture_performance: { web_vitals: true }, // $web_vitals (LCP/INP/CLS/FCP)
      disable_session_recording: false, // replay on, masked (consent-gated)
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      persistence: "localStorage+cookie",
      // Share the anonymous id across gogocash.co <-> app.gogocash.co so landing
      // engagement links to the eventual app signup (#identity). UTM/referrer are
      // auto-captured by posthog-js. The app must use the same project + setting.
      cross_subdomain_cookie: true,
    });
    client = posthog;
    // Capture the page the visitor is on at init (route listener handles the rest).
    posthogCapturePageView(
      `${window.location.pathname}${window.location.search}`,
    );
  } catch (err) {
    logPostHogDebug("init failed", err);
  } finally {
    initializing = false;
  }
}

/**
 * Reconcile PostHog with the current consent decision: init or re-enable on
 * grant, opt out + reset on revoke. Safe to call repeatedly.
 */
export async function syncPostHogConsent(): Promise<void> {
  if (posthogAllowed()) {
    if (client) client.opt_in_capturing();
    else await initPostHog();
  } else if (client) {
    client.opt_out_capturing();
    client.reset();
  }
}

/** Manual SPA pageview for App Router route changes. */
export function posthogCapturePageView(path: string): void {
  if (!client || !posthogAllowed()) return;
  try {
    // Keep locale super-properties current across SPA navigations.
    client.register(localeSuperProps());
    client.capture("$pageview", {
      path,
      $current_url: window.location.href,
    });
  } catch (err) {
    logPostHogDebug("pageview capture failed", err);
  }
}

/** Capture a custom event, gated on config + consent. Safe before init (no-op). */
export function posthogCapture(
  event: string,
  props?: Record<string, unknown>,
): void {
  if (!client || !posthogAllowed()) return;
  try {
    client.capture(event, props);
  } catch (err) {
    logPostHogDebug(`capture "${event}" failed`, err);
  }
}

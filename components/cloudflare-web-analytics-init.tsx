"use client";

import { useEffect } from "react";
import {
  publicCloudflareWebAnalyticsToken,
  shouldLoadCloudflareWebAnalytics,
} from "@/lib/app-config";
import {
  COOKIE_CONSENT_EVENT,
  isAnalyticsAllowed,
} from "@/lib/cookie-consent";

const CLOUDFLARE_WEB_ANALYTICS_ID = "cloudflare-web-analytics";
const CLOUDFLARE_WEB_ANALYTICS_SRC =
  "https://static.cloudflareinsights.com/beacon.min.js";

function removeCloudflareWebAnalyticsScript(): void {
  document.getElementById(CLOUDFLARE_WEB_ANALYTICS_ID)?.remove();
}

function syncCloudflareWebAnalytics(): void {
  if (!shouldLoadCloudflareWebAnalytics() || !isAnalyticsAllowed()) {
    removeCloudflareWebAnalyticsScript();
    return;
  }

  if (document.getElementById(CLOUDFLARE_WEB_ANALYTICS_ID)) return;

  const token = publicCloudflareWebAnalyticsToken();
  if (!token) return;

  const script = document.createElement("script");
  script.id = CLOUDFLARE_WEB_ANALYTICS_ID;
  script.defer = true;
  script.src = CLOUDFLARE_WEB_ANALYTICS_SRC;
  script.setAttribute("data-cf-beacon", JSON.stringify({ token }));
  document.head.appendChild(script);
}

/**
 * Browser-only Cloudflare Web Analytics bootstrap. The token is public, but the
 * beacon still waits for the visitor's analytics consent before loading.
 */
export function CloudflareWebAnalyticsInit() {
  useEffect(() => {
    syncCloudflareWebAnalytics();
    window.addEventListener(
      COOKIE_CONSENT_EVENT,
      syncCloudflareWebAnalytics,
    );
    return () =>
      window.removeEventListener(
        COOKIE_CONSENT_EVENT,
        syncCloudflareWebAnalytics,
      );
  }, []);

  return null;
}

"use client";

import type { ReactNode } from "react";
import { BrowserLocaleBootstrap } from "@/components/browser-locale-bootstrap";
import { CloudflareWebAnalyticsInit } from "@/components/cloudflare-web-analytics-init";
import { PostHogInit } from "@/components/posthog-init";
import { AnalyticsRouteListener } from "@/components/analytics-route-listener";
import CookieConsent from "@/components/cookie-consent";

/**
 * Client-only providers and shell (analytics, locale, loading).
 * LINE Tag stays in `app/layout.tsx` (noscript + script ordering).
 */
export function AppClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <BrowserLocaleBootstrap />
      <CloudflareWebAnalyticsInit />
      <PostHogInit />
      <AnalyticsRouteListener />
      <div className="min-h-[100dvh] min-w-0 overflow-x-clip">{children}</div>
      <CookieConsent />
    </>
  );
}

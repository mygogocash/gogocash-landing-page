"use client";

import type { ReactNode } from "react";
import { BrowserLocaleBootstrap } from "@/components/browser-locale-bootstrap";
import { FirebaseClientInit } from "@/components/firebase-client-init";
import { PostHogInit } from "@/components/posthog-init";
import { MixpanelInit } from "@/components/mixpanel-init";
import { AnalyticsRouteListener } from "@/components/analytics-route-listener";
import CookieConsent from "@/components/cookie-consent";
import DocumentLangSync from "@/components/document-lang-sync";

/**
 * Client-only providers and shell (analytics, locale, loading).
 * LINE Tag stays in `app/layout.tsx` (noscript + script ordering).
 */
export function AppClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <DocumentLangSync />
      <BrowserLocaleBootstrap />
      <FirebaseClientInit />
      <PostHogInit />
      <MixpanelInit />
      <AnalyticsRouteListener />
      {children}
      <CookieConsent />
    </>
  );
}

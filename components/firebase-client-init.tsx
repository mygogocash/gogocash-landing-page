"use client";

import { useEffect } from "react";
import { syncFirebaseAnalyticsConsent } from "@/lib/analytics-client";
import { COOKIE_CONSENT_EVENT } from "@/lib/cookie-consent";

/**
 * Browser-only Firebase/GA4 consent bridge. The SDK itself is dynamically loaded
 * by `syncFirebaseAnalyticsConsent`, so it is absent before an analytics opt-in.
 */
export function FirebaseClientInit() {
  useEffect(() => {
    void syncFirebaseAnalyticsConsent();
    const onConsent = () => void syncFirebaseAnalyticsConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  return null;
}

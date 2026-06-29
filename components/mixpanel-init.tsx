"use client";

import { useEffect } from "react";
import { COOKIE_CONSENT_EVENT } from "@/lib/cookie-consent";
import { syncMixpanelConsent } from "@/lib/mixpanel-client";

/**
 * Browser-only Mixpanel bootstrap, gated on cookie consent (#7). Mirrors
 * PostHogInit: nothing loads until the visitor accepts, and a later
 * accept/reject re-syncs capture state.
 */
export function MixpanelInit() {
  useEffect(() => {
    void syncMixpanelConsent(); // returning visitors who already accepted
    const onConsent = () => void syncMixpanelConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  return null;
}

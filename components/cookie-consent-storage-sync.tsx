"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  parseConsent,
} from "@/lib/cookie-consent";

/** Propagate another tab's persisted choice through the existing tracker event. */
export function CookieConsentStorageSync() {
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== COOKIE_CONSENT_KEY) return;
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_EVENT, {
          detail: parseConsent(event.newValue),
        }),
      );
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return null;
}

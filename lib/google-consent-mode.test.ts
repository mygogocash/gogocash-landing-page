import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleConsentSettingsForPreferences } from "./google-consent-mode";

describe("Google Consent Mode v2 mapping", () => {
  for (const analytics of [false, true] as const) {
    it(`maps analytics=${analytics} without enabling ad signals`, () => {
      assert.deepEqual(
        googleConsentSettingsForPreferences(analytics),
        {
          analytics_storage: analytics ? "granted" : "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        },
      );
    });
  }
});

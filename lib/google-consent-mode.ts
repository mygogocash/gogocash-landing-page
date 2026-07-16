export type GoogleConsentStatus = "granted" | "denied";

export type GoogleConsentSettings = {
  analytics_storage: GoogleConsentStatus;
  ad_storage: GoogleConsentStatus;
  ad_user_data: GoogleConsentStatus;
  ad_personalization: GoogleConsentStatus;
};

/** Enable aggregate analytics only; GoGoCash never enables Google's ad signals. */
export function googleConsentSettingsForPreferences(
  analytics: boolean,
): GoogleConsentSettings {
  const analyticsStatus = analytics ? "granted" : "denied";
  return {
    analytics_storage: analyticsStatus,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

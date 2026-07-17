import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import {
  SOCIAL_PREVIEW_DESCRIPTION,
  SOCIAL_PREVIEW_TITLE,
  buildWebsiteSocialMetadata,
} from "@/lib/social-preview";

export const metadata: Metadata = {
  title: SOCIAL_PREVIEW_TITLE,
  description: SOCIAL_PREVIEW_DESCRIPTION,
  alternates: { canonical: "/", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "en_US",
    title: SOCIAL_PREVIEW_TITLE,
    description: SOCIAL_PREVIEW_DESCRIPTION,
    url: "/",
  }),
};

/** Partner list is resolved at build time; rebuild to refresh. */
export default async function Page() {
  const partners = await fetchPartnerBrands();
  return <HomePage initialPartners={partners} />;
}

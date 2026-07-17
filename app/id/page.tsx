import type { Metadata } from "next";
import LocaleHomePage from "@/components/locale-home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";
import { faqItemsForLocale } from "@/lib/locale-faq";
import { localeHomeCopy } from "@/lib/locale-home-registry";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: "GoGoCash — Cashback di Asia Tenggara",
  description: `Belanja di Shopee, Lazada, Agoda dan ${SITE_FACTS.partnerCountLabel} mitra. Dapat cashback nyata — gratis. GoGoCash untuk Indonesia dan Asia Tenggara.`,
  alternates: { canonical: "/id", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "id_ID",
    title: "GoGoCash — Cashback nyata di Asia Tenggara",
    description:
      "Mulai dari tautan GoGoCash, belanja seperti biasa, dan klaim cashback setelah pesanan dikonfirmasi mitra.",
    url: "/id",
  }),
};

export default async function IndonesianLandingPage() {
  const partners = await fetchPartnerBrands();
  return (
    <LocaleHomePage
      initialPartners={partners}
      copy={localeHomeCopy("id")}
      faqItems={faqItemsForLocale("id")}
    />
  );
}

import type { Metadata } from "next";
import LocaleHomePage from "@/components/locale-home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";
import { faqItemsForLocale } from "@/lib/locale-faq";
import { localeHomeCopy } from "@/lib/locale-home-registry";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: `GoGoCash — รับแคชแบ็กสูงสุด ${SITE_FACTS.maxCashbackLabel} ช้อปออนไลน์ SEA`,
  description: `ช้อป Shopee Lazada Agoda และพันธมิตรกว่า ${SITE_FACTS.partnerCountLabel} ราย รับแคชแบ็กจริงผ่าน GoGoCash ใช้ฟรี เริ่มจากลิงก์หรือมินิแอปแล้วช้อปตามปกติ`,
  alternates: { canonical: "/th", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "th_TH",
    title: "GoGoCash — แคชแบ็กจริงทั่วเอเชียตะวันออกเฉียงใต้",
    description:
      "แพลตฟอร์มช้อปแล้วได้เงินคืน เริ่มจาก GoGoCash แล้วไปชำระเงินที่แบรนด์พันธมิตร",
    url: "/th",
  }),
};

/** Thai landing mirrors the English homepage structure; partners load at build time. */
export default async function ThaiLandingPage() {
  const partners = await fetchPartnerBrands();
  return (
    <LocaleHomePage
      initialPartners={partners}
      copy={localeHomeCopy("th")}
      faqItems={faqItemsForLocale("th")}
    />
  );
}

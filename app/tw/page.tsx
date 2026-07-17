import type { Metadata } from "next";
import LocaleHomePage from "@/components/locale-home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";
import { faqItemsForLocale } from "@/lib/locale-faq";
import { localeHomeCopy } from "@/lib/locale-home-registry";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: `GoGoCash — 東南亞最高 ${SITE_FACTS.maxCashbackLabel} 現金回饋｜台灣繁中`,
  description: `透過 GoGoCash 在 Shopee、Lazada、Agoda 等 ${SITE_FACTS.partnerCountLabel} 個合作品牌賺真實現金回饋。免費使用，從連結或 Mini App 開始購物即可。`,
  alternates: { canonical: "/tw", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "zh_TW",
    title: "GoGoCash — 東南亞現金回饋平台",
    description:
      "從 GoGoCash 前往合作商家消費，訂單確認後享現金回饋。Telegram／LINE 迷你應用程式與網頁皆可使用。",
    url: "/tw",
  }),
};

export default async function TaiwanLandingPage() {
  const partners = await fetchPartnerBrands();
  return (
    <LocaleHomePage
      initialPartners={partners}
      copy={localeHomeCopy("tw")}
      faqItems={faqItemsForLocale("tw")}
    />
  );
}

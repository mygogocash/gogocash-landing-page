import type { Metadata } from "next";
import LocaleHomePage from "@/components/locale-home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";
import { faqItemsForLocale } from "@/lib/locale-faq";
import { localeHomeCopy } from "@/lib/locale-home-registry";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: `GoGoCash — 最大${SITE_FACTS.maxCashbackLabel}キャッシュバック｜東南アジア向け（日本語）`,
  description: `Shopee、Lazada、Agoda など ${SITE_FACTS.partnerCountLabel} のパートナーで GoGoCash 経由のお買い物によるリアルキャッシュバック。無料で利用開始。`,
  alternates: { canonical: "/ja", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "ja_JP",
    title: "GoGoCash — 東南アジアで使えるキャッシュバック",
    description:
      "GoGoCash から提携店で購入し、注文確定後にキャッシュバック。Telegram / LINE ミニアプリと Web に対応。",
    url: "/ja",
  }),
};

export default async function JapanLandingPage() {
  const partners = await fetchPartnerBrands();
  return (
    <LocaleHomePage
      initialPartners={partners}
      copy={localeHomeCopy("ja")}
      faqItems={faqItemsForLocale("ja")}
    />
  );
}

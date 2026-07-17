import type { Metadata } from "next";
import LocaleHomePage from "@/components/locale-home-page";
import { fetchPartnerBrands } from "@/lib/involve-asia";
import { HREFLANG_LANDING_ALTERNATES } from "@/lib/seo-constants";
import { buildWebsiteSocialMetadata } from "@/lib/social-preview";
import { faqItemsForLocale } from "@/lib/locale-faq";
import { localeHomeCopy } from "@/lib/locale-home-registry";
import { SITE_FACTS } from "@/lib/site-facts";

export const metadata: Metadata = {
  title: `GoGoCash — 东南亚最高 ${SITE_FACTS.maxCashbackLabel} 现金回馈｜简体中文`,
  description: `通过 GoGoCash 在 Shopee、Lazada、Agoda 等 ${SITE_FACTS.partnerCountLabel} 个合作品牌赚真实现金回馈。免费使用，从链接或 Mini App 开始购物即可。`,
  alternates: { canonical: "/cn", languages: HREFLANG_LANDING_ALTERNATES },
  ...buildWebsiteSocialMetadata({
    locale: "zh_CN",
    title: "GoGoCash — 东南亚现金回馈平台",
    description:
      "从 GoGoCash 前往合作商家消费，订单确认后享现金回馈。Telegram／LINE 迷你应用程序与网页皆可使用。",
    url: "/cn",
  }),
};

export default async function ChinaLandingPage() {
  const partners = await fetchPartnerBrands();
  return (
    <LocaleHomePage
      initialPartners={partners}
      copy={localeHomeCopy("cn")}
      faqItems={faqItemsForLocale("cn")}
    />
  );
}

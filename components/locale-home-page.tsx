import Header from "@/components/header";
import Footer from "@/components/footer";
import { WEB_APP_HREF } from "@/components/social-data";
import { HOW_IT_WORKS_ILLUSTRATION_PATHS } from "@/lib/how-it-works-illustrations";
import { type HowItWorksStep } from "@/components/landing/how-it-works-interactive";
import MerchantOffersStrip from "@/components/landing/merchant-offers-strip";
import QuestsSection from "@/components/landing/quests-section";
import FaqJsonLd from "@/components/faq-json-ld";
import SectionViewTracker from "@/components/section-view-tracker";
import type { PartnerBrand } from "@/lib/involve-asia";
import type { LocaleHomeCopy } from "@/lib/locale-home-copy";
import {
  FinalCtaSection,
  FaqSection,
  HowItWorksSection,
} from "@/components/landing/common-sections";
import {
  LocaleCommunitySection,
  LocaleDownloadSection,
  LocaleFeatureGridSection,
  LocaleHomeHeroSection,
  LocaleLearnSection,
  LocaleWhySection,
} from "@/components/landing/locale-home-sections";

export type LocaleFaqItem = { question: string; answer: string };

export type LocaleHomePageProps = {
  initialPartners: PartnerBrand[];
  copy: LocaleHomeCopy;
  faqItems: LocaleFaqItem[];
};

export default function LocaleHomePage({
  initialPartners,
  copy,
  faqItems,
}: LocaleHomePageProps) {
  const howItWorksSteps: HowItWorksStep[] = copy.howItWorks.steps.map(
    (step, index) => ({
      ...step,
      illustrationSrc: HOW_IT_WORKS_ILLUSTRATION_PATHS[index],
      illustrationAlt: step.title,
      ...(index === 0
        ? {
            ctaLabel: copy.howItWorks.browseAppCta,
            ctaHref: WEB_APP_HREF,
          }
        : {}),
    }),
  );

  return (
    <>
      <Header />
      <SectionViewTracker />
      <main
        id="main-content"
        role="main"
        lang={copy.documentLang}
        tabIndex={-1}
      >
        <LocaleHomeHeroSection copy={copy} />

        <MerchantOffersStrip
          partners={initialPartners}
          sectionBadgeLabel={copy.partners.badge}
          heading={copy.partners.title}
          description={copy.partners.description}
          searchLabel={copy.partners.searchLabel}
          searchPlaceholder={copy.partners.searchPlaceholder}
          searchClearLabel={copy.partners.searchClear}
          noResultsMessage={copy.partners.noResults}
          brandsCountAll={copy.partners.brandsCountAll}
          brandsCountFiltered={copy.partners.brandsCountFiltered}
          loadMoreLabel={copy.partners.loadMore}
          partnerLogoAltTemplate={copy.partnerLogoAltTemplate}
        />

        <LocaleWhySection copy={copy} />
        <LocaleFeatureGridSection copy={copy} />
        <QuestsSection copy={copy.quests} />
        <HowItWorksSection
          title={copy.howItWorks.title}
          intro={copy.howItWorks.intro}
          progressCue={copy.howItWorks.progressCue}
          steps={howItWorksSteps}
        />
        <LocaleDownloadSection copy={copy} />
        <LocaleLearnSection
          copy={copy}
          learnArticleLang={copy.learnArticleLang ?? "en"}
        />
        <LocaleCommunitySection copy={copy} />
        <FaqSection
          badge={copy.faq.badge}
          title={copy.faq.title}
          items={faqItems}
          subtitle={copy.faq.subtitleEnHint}
          englishLinkLabel={copy.langNavEnglish}
        />
        <FaqJsonLd items={faqItems} />
        <FinalCtaSection
          title={copy.finalCta.title}
          subtitle={copy.finalCta.sub}
          ctaLabel={copy.finalCta.cta}
        />
      </main>
      <Footer />
    </>
  );
}

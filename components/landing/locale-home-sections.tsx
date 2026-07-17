import Link from "next/link";
import AnimateOnScroll from "@/components/animate-on-scroll";
import SectionBadge from "@/components/section-badge";
import { LINE_LOCALIZED_CONTACT_HREF } from "@/components/social-data";
import type { LocaleHomeCopy } from "@/lib/locale-home-copy";
import {
  ArrowUpRight,
  Coins,
  MessageCircle,
  Merchant,
  Sparkles,
  Trophy,
} from "@/components/icons";
import {
  twNavTextMotion,
  twPressSm,
  twTransitionButton,
} from "@/lib/motion-styles";
import {
  uiCardTitle,
  uiLinkCta,
  uiSectionTitleCompact,
} from "@/lib/ui-classes";
import { MarketingHeroSection } from "@/components/landing/english-home-sections";
import AppDownloadSection from "@/components/landing/app-download-section";
import CommunitySection from "@/components/landing/community-section";
import { FeatureHighlightsGrid } from "@/components/landing/feature-highlights-grid";
import { WhyChooseMarketingSection } from "@/components/landing/why-choose-marketing-section";

const WHY_ICONS = [Coins, Merchant, Trophy, MessageCircle] as const;
const WHY_BG = ["bg-mint", "bg-cream", "bg-cream", "bg-mint"] as const;

export function LocaleHomeHeroSection({
  copy,
}: {
  copy: LocaleHomeCopy;
}) {
  return (
    <MarketingHeroSection
      top={
        <nav
          aria-label={copy.breadcrumbNavAria}
          className="mb-8 flex shrink-0 flex-wrap justify-center gap-4 text-sm md:justify-start"
        >
          <Link
            href="/"
            lang="en"
            className={`font-medium text-primary hover:text-primary-dark ${twNavTextMotion}`}
          >
            {copy.langNavEnglish}
          </Link>
          <span className="text-gray-300" aria-hidden>
            |
          </span>
          <span className="font-medium text-gray-700">{copy.langNavLocal}</span>
        </nav>
      }
      title={copy.hero.h1}
      subtitle={copy.hero.sub}
      body={copy.hero.body}
      launchLabel={copy.hero.ctaLaunch}
      contactLabel={copy.hero.ctaLine}
      contactAriaLabel={copy.hero.lineAria}
      contactHref={LINE_LOCALIZED_CONTACT_HREF}
    />
  );
}

export function LocaleWhySection({
  copy,
}: {
  copy: LocaleHomeCopy;
}) {
  return (
    <WhyChooseMarketingSection
      badgeIcon={<Sparkles className="h-4 w-4" />}
      badgeLabel={copy.why.badge}
      title={copy.why.title}
      subtitle={copy.why.subtitle}
      cards={copy.why.cards}
      iconComponents={WHY_ICONS}
      cardBackgrounds={WHY_BG}
    />
  );
}

export function LocaleFeatureGridSection({
  copy,
}: {
  copy: LocaleHomeCopy;
}) {
  return (
    <FeatureHighlightsGrid
      badge={
        <SectionBadge
          icon={<Sparkles className="h-4 w-4" />}
          label={copy.features.badge}
        />
      }
      sectionTitle={copy.features.title}
      cards={copy.features.cards}
      icons={[Coins, MessageCircle, Trophy]}
      ctaCard={{
        title: copy.features.ctaCard.title,
        bodyLine: copy.features.ctaCard.bodyLine,
        ctaLabel: copy.features.ctaCard.cta,
      }}
    />
  );
}

export function LocaleDownloadSection({
  copy,
}: {
  copy: LocaleHomeCopy;
}) {
  return <AppDownloadSection copy={copy.download} />;
}

export function LocaleLearnSection({
  copy,
  learnArticleLang,
}: {
  copy: LocaleHomeCopy;
  learnArticleLang: string;
}) {
  return (
    <section
      id="learn"
      className="scroll-mt-28 border-t border-gray-100 bg-white py-16 md:py-20"
    >
      <div className="mx-auto min-w-0 max-w-site px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="flex flex-col items-center text-center">
            <SectionBadge label={copy.learn.badge} />
            <h2 className={`mt-6 ${uiSectionTitleCompact}`}>
              {copy.learn.title}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.learn.teasers.map((item, index) => (
            <AnimateOnScroll key={item.href} delay={index * 100}>
              <a
                href={item.href}
                lang={learnArticleLang}
                className={`group flex h-full flex-col rounded-2xl border border-gray-100 bg-cream/50 p-6 hover:border-primary/20 hover:shadow-md ${twTransitionButton} ${twPressSm}`}
              >
                <h3 className={uiCardTitle}>
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-gray-500">
                  {item.desc}
                </p>
                <span className={`mt-4 inline-flex items-center gap-1 text-sm ${uiLinkCta}`}>
                  {copy.learn.readMore}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-button ease-standard motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocaleCommunitySection({
  copy,
}: {
  copy: LocaleHomeCopy;
}) {
  return <CommunitySection copy={copy.community} />;
}

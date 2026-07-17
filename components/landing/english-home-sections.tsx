import type { ReactNode } from "react";
import LaunchAppLink from "@/components/launch-app-link";
import { heroEarnSupportingParagraph } from "@/lib/site-facts";
import { ArrowUpRight } from "@/components/icons";
import { LINE_OFFICIAL_ACCOUNT_HREF } from "@/components/social-data";
import {
  twCtaOutlineMotion,
  twCtaPrimaryMotion,
} from "@/lib/motion-styles";
import {
  uiCtaPrimarySurfaceRoundedXl,
} from "@/lib/ui-classes";
import { LandingHeroShell } from "@/components/landing/landing-hero-shell";

type MarketingHeroSectionProps = {
  top?: ReactNode;
  title: string;
  subtitle: string;
  body: ReactNode;
  launchLabel: string;
  contactLabel: string;
  contactAriaLabel: string;
  contactHref: string;
};

export function MarketingHeroSection({
  top,
  title,
  subtitle,
  body,
  launchLabel,
  contactLabel,
  contactAriaLabel,
  contactHref,
}: MarketingHeroSectionProps) {
  return (
    <LandingHeroShell top={top}>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center text-center">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl lg:leading-[1.08]">
              {title}
            </h1>
            <p className="mt-4 text-lg font-medium text-gray-800 md:text-xl">
              {subtitle}
            </p>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
              {body}
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <LaunchAppLink
              surface="hero"
              className={`group min-h-12 w-full items-center justify-center gap-2 px-8 py-3.5 text-base sm:w-auto sm:min-w-[200px] ${uiCtaPrimarySurfaceRoundedXl} ${twCtaPrimaryMotion}`}
            >
              {launchLabel}
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </LaunchAppLink>
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={contactAriaLabel}
              className={`group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-normal text-gray-900 shadow-sm hover:border-gray-400 hover:bg-gray-50 sm:w-auto sm:min-w-[200px] ${twCtaOutlineMotion}`}
            >
              {contactLabel}
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-button ease-standard group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </a>
          </div>
        </div>
      </div>
    </LandingHeroShell>
  );
}

export function EnglishHomeHeroSection() {
  return (
    <MarketingHeroSection
      title="Earn Cashback on Every Spend"
      subtitle="With GoGoCash — on brands you already shop"
      body={heroEarnSupportingParagraph()}
      launchLabel="Start earning"
      contactLabel="Contact us"
      contactAriaLabel="Contact us on LINE"
      contactHref={LINE_OFFICIAL_ACCOUNT_HREF}
    />
  );
}

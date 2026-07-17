import type { ReactNode } from "react";
import { ResponsiveMarketingPicture } from "@/components/responsive-marketing-picture";

const HERO_IMAGE_SIZES = "(max-width: 1200px) calc(100vw - 3rem), 1120px";
const HERO_IMAGE_CLASS =
  "mx-auto block h-auto w-full max-h-[min(52vh,34rem)] max-w-full object-contain object-bottom drop-shadow-[0_24px_48px_-12px_rgba(16,185,129,0.15)] sm:max-h-[min(56vh,36rem)] lg:max-h-[min(60vh,38rem)]";

/**
 * Shared hero frame for English and locale marketing homes: gradient section,
 * padded column, optional top slot (e.g. locale breadcrumb), then main column + phones art.
 */
export function LandingHeroShell({
  top,
  children,
}: {
  top?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] flex-col scroll-mt-28 overflow-hidden hero-gradient"
    >
      <div className="relative z-10 mx-auto flex min-h-0 w-full min-w-0 max-w-site flex-1 flex-col px-4 pb-0 pt-28 sm:px-6 md:pt-32 lg:px-8">
        {top}
        {children}
        <LandingHeroPhonesImage />
      </div>
    </section>
  );
}

export function LandingHeroPhonesImage({
  priority = true,
}: {
  priority?: boolean;
} = {}) {
  return (
    <div className="w-full min-w-0 shrink-0 leading-none">
      <ResponsiveMarketingPicture
        fallback="/images/hero-dashboard-phones-1200.webp"
        avif={[
          ["/images/hero-dashboard-phones-480.avif", 480],
          ["/images/hero-dashboard-phones-800.avif", 800],
          ["/images/hero-dashboard-phones-1200.avif", 1200],
          ["/images/hero-dashboard-phones-1600.avif", 1600],
        ]}
        webp={[
          ["/images/hero-dashboard-phones-480.webp", 480],
          ["/images/hero-dashboard-phones-800.webp", 800],
          ["/images/hero-dashboard-phones-1200.webp", 1200],
          ["/images/hero-dashboard-phones-1600.webp", 1600],
        ]}
        alt="GoGoCash app preview on two phones"
        width={1600}
        height={1200}
        priority={priority}
        className={HERO_IMAGE_CLASS}
        sizes={HERO_IMAGE_SIZES}
      />
    </div>
  );
}

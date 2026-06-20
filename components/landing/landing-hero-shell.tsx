import Image from "next/image";
import type { ReactNode } from "react";
import { HERO_DASHBOARD_PHONES_IMAGE } from "@/lib/seo-assets";

const HERO_IMAGE_SIZES = "(max-width: 1200px) calc(100vw - 3rem), 1120px";
const HERO_IMAGE_CLASS =
  "mx-auto block h-auto w-full max-h-[min(30vh,16rem)] max-w-[12rem] object-contain object-bottom drop-shadow-[0_24px_48px_-12px_rgba(16,185,129,0.15)] sm:max-h-[min(56vh,36rem)] sm:max-w-full lg:max-h-[min(60vh,38rem)]";

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
      <Image
        src={HERO_DASHBOARD_PHONES_IMAGE.src}
        alt="GoGoCash app preview on two phones"
        width={HERO_DASHBOARD_PHONES_IMAGE.width}
        height={HERO_DASHBOARD_PHONES_IMAGE.height}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        className={HERO_IMAGE_CLASS}
        sizes={HERO_IMAGE_SIZES}
      />
    </div>
  );
}

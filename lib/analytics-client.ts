import { posthogCapture } from "@/lib/posthog-client";

/** Site search page (`/search?q=`). */
export function logSiteSearch(searchTerm: string): void {
  const term = searchTerm.trim();
  if (!term) return;
  posthogCapture("site_search", { query: term });
}

export function logLocaleLanguageSelect(lang: string): void {
  posthogCapture("locale_language_selected", { lang });
}

export function logLocaleRegionSelect(region: string): void {
  posthogCapture("locale_region_selected", { region });
}

/**
 * Primary "launch app" CTA. `destination` is the resolved target (web on desktop,
 * LINE on mobile); `placement` is where on the page it was clicked (hero, final,
 * feature, header, quests) — powering CTA-performance breakdowns in PostHog.
 */
export function logLaunchAppClick(
  destination: "web_desktop" | "line_mobile",
  placement = "unknown",
): void {
  posthogCapture("cta_clicked", { destination, placement });
}

export function logBrandsLoadMore(
  visibleCount: number,
  totalBrands: number,
): void {
  posthogCapture("brands_load_more", {
    visible: visibleCount,
    total: totalBrands,
  });
}

// --- Engagement events (PostHog-focused; drive scroll-depth + content interest) ---

/** A FAQ question was expanded. */
export function logFaqOpen(question: string): void {
  posthogCapture("faq_opened", { question });
}

/** A "How it works" tab was selected. */
export function logHowItWorksTab(step: number, label: string): void {
  posthogCapture("how_it_works_tab", { step, label });
}

/** A page section first scrolled into view (once per section). */
export function logSectionView(section: string): void {
  posthogCapture("section_viewed", { section });
}

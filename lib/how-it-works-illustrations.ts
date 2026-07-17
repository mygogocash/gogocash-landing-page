/** WebP fallbacks for How it works steps (same order EN + locale homes). */
export const HOW_IT_WORKS_ILLUSTRATION_PATHS = [
  "/images/how-it-works/browse-and-pick-your-brand-768.webp",
  "/images/how-it-works/shop-the-way-you-already-do-768.webp",
  "/images/how-it-works/cashback-after-the-merchant-confirms-768.webp",
] as const;

const RESPONSIVE_WIDTHS = [320, 512, 768, 1024] as const;

export function howItWorksIllustrationCandidates(
  fallback: string,
  format: "avif" | "webp",
) {
  const base = fallback.replace(/-768\.webp$/, "");
  return RESPONSIVE_WIDTHS.map(
    (width) => [`${base}-${width}.${format}`, width] as const,
  );
}

export function howItWorksIllustrationSrc(
  stepIndex: number,
): string | undefined {
  return HOW_IT_WORKS_ILLUSTRATION_PATHS[stepIndex];
}

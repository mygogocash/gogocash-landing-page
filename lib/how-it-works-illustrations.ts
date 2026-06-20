import { HOW_IT_WORKS_IMAGE_PATHS } from "@/lib/seo-assets";

/** Optimized paths for How it works steps (same order EN + locale homes). */
export const HOW_IT_WORKS_ILLUSTRATION_PATHS = HOW_IT_WORKS_IMAGE_PATHS;

export function howItWorksIllustrationSrc(
  stepIndex: number,
): string | undefined {
  return HOW_IT_WORKS_ILLUSTRATION_PATHS[stepIndex];
}

import type { Metadata } from "next";
import { SITE_FACTS } from "@/lib/site-facts";

/** Default link / Open Graph copy for https://gogocash.co (root + shared fallback). */
export const SOCIAL_PREVIEW_TITLE =
  "Earn Cashback on Every Spend with GoGoCash";

export const SOCIAL_PREVIEW_DESCRIPTION =
  `Discover deals across top brands and earn up to ${SITE_FACTS.maxCashbackLabel} instant cashback with AI-powered support and personalized shopping rewards.`;

/** Served from `public/images/`; JPEG 1024×537. */
export const OG_IMAGE_PATH = "/images/gogocash-social-preview.jpg";

export const OG_IMAGE_WIDTH = 1024;
export const OG_IMAGE_HEIGHT = 537;

export const OG_IMAGE_ALT =
  "GoGoCash — earn cashback on every spend with top brands";

type WebsiteSocialMetadataOptions = {
  title: string;
  description: string;
  locale: string;
  url: string;
};

/** Complete per-route social metadata; page-level objects replace layout fallbacks. */
export function buildWebsiteSocialMetadata({
  title,
  description,
  locale,
  url,
}: WebsiteSocialMetadataOptions) {
  return {
    openGraph: {
      type: "website",
      locale,
      url,
      siteName: "GoGoCash",
      title,
      description,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  } satisfies Pick<Metadata, "openGraph" | "twitter">;
}

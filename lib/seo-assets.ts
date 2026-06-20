export type SeoImageAsset = {
  src: string;
  width: number;
  height: number;
};

export const HERO_DASHBOARD_PHONES_IMAGE: SeoImageAsset = {
  src: "/images/hero-dashboard-phones.webp",
  width: 800,
  height: 600,
};

export const HOW_IT_WORKS_IMAGE_PATHS = [
  "/images/how-it-works/browse-and-pick-your-brand.webp",
  "/images/how-it-works/shop-the-way-you-already-do.webp",
  "/images/how-it-works/cashback-after-the-merchant-confirms.webp",
] as const;

export const LOGO_MARK_IMAGE: SeoImageAsset = {
  src: "/images/gogocash-logo-mark.png",
  width: 256,
  height: 256,
};

export const LOGO_MARK_UI_IMAGE: SeoImageAsset = {
  src: "/images/gogocash-logo-mark-ui.png",
  width: 64,
  height: 64,
};

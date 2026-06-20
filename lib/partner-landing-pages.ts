import { LINE_MINI_APP_HREF, WEB_APP_HREF } from "@/components/social-data";

export type PartnerLandingPage = {
  slug: string;
  partnerName: string;
  headline: string;
  description: string;
  bullets: readonly string[];
  metaTitle: string;
  metaDescription: string;
  category: string;
};

export const PARTNER_LANDING_PAGES: readonly PartnerLandingPage[] = [
  {
    slug: "shopee",
    partnerName: "Shopee",
    headline: "Earn Shopee cashback with GoGoCash",
    description:
      "Start your Shopee trip from GoGoCash before checkout so eligible purchases can track for withdrawable cashback after merchant confirmation.",
    bullets: [
      "Open Shopee from GoGoCash before adding items or paying.",
      "Keep cookies and tracking enabled during checkout.",
      "Check your GoGoCash activity after the merchant validates the order.",
    ],
    metaTitle: "Shopee Cashback with GoGoCash",
    metaDescription:
      "Open Shopee from GoGoCash to track eligible marketplace orders and earn withdrawable cashback after merchant confirmation.",
    category: "Marketplace",
  },
  {
    slug: "lazada",
    partnerName: "Lazada",
    headline: "Earn Lazada cashback with GoGoCash",
    description:
      "Use GoGoCash before visiting Lazada so eligible orders can be attributed and confirmed as cashback once the merchant validates them.",
    bullets: [
      "Start from the GoGoCash app or web experience.",
      "Complete checkout in the same browser or app session.",
      "Avoid ad blockers or coupon extensions that can interrupt tracking.",
    ],
    metaTitle: "Lazada Cashback with GoGoCash",
    metaDescription:
      "Start Lazada orders from GoGoCash to keep eligible marketplace cashback tracking clear from click to confirmation.",
    category: "Marketplace",
  },
  {
    slug: "agoda",
    partnerName: "Agoda",
    headline: "Earn Agoda travel cashback with GoGoCash",
    description:
      "Book hotels through GoGoCash before visiting Agoda so eligible travel purchases can track and confirm after stay validation.",
    bullets: [
      "Open Agoda from GoGoCash before searching or booking.",
      "Expect travel cashback to confirm later than everyday shopping.",
      "Keep booking details unchanged when possible to avoid attribution issues.",
    ],
    metaTitle: "Agoda Cashback with GoGoCash",
    metaDescription:
      "Book Agoda hotels from GoGoCash and earn eligible travel cashback after merchant and stay confirmation.",
    category: "Travel",
  },
  {
    slug: "trip-com",
    partnerName: "Trip.com",
    headline: "Earn Trip.com cashback with GoGoCash",
    description:
      "Start Trip.com bookings from GoGoCash to keep eligible hotel and flight purchases connected to cashback tracking.",
    bullets: [
      "Launch Trip.com from GoGoCash before comparing travel deals.",
      "Complete the booking without switching cashback or coupon sources.",
      "Review confirmation timing because travel merchants validate later.",
    ],
    metaTitle: "Trip.com Cashback with GoGoCash",
    metaDescription:
      "Use GoGoCash before Trip.com bookings to track eligible hotel and flight cashback through merchant validation.",
    category: "Travel",
  },
  {
    slug: "aliexpress",
    partnerName: "AliExpress",
    headline: "Earn AliExpress cashback with GoGoCash",
    description:
      "Open AliExpress from GoGoCash before checkout so eligible cross-border shopping orders can track for cashback.",
    bullets: [
      "Begin the shopping session from GoGoCash.",
      "Keep the checkout flow in the same session after clicking through.",
      "Wait for merchant validation before treating cashback as confirmed.",
    ],
    metaTitle: "AliExpress Cashback with GoGoCash",
    metaDescription:
      "Start AliExpress shopping from GoGoCash to track eligible cross-border orders and cashback confirmation.",
    category: "Marketplace",
  },
] as const;

export const PARTNER_LANDING_DESTINATIONS = {
  web: WEB_APP_HREF,
  line: LINE_MINI_APP_HREF,
} as const;

export function partnerLandingPageBySlug(
  slug: string,
): PartnerLandingPage | undefined {
  return PARTNER_LANDING_PAGES.find((page) => page.slug === slug);
}

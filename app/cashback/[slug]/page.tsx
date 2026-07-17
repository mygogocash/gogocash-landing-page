import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnerLpTemplate from "@/components/landing/partner-lp-template";
import {
  PARTNER_LANDING_PAGES,
  partnerLandingPageBySlug,
} from "@/lib/partner-landing-pages";
import { siteOrigin } from "@/lib/site";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
} from "@/lib/social-preview";

export const dynamic = "force-static";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PARTNER_LANDING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = partnerLandingPageBySlug(slug);
  if (!page) return {};
  const path = `/cashback/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: page.metaTitle,
      description: page.metaDescription,
      url: path,
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
      title: page.metaTitle,
      description: page.metaDescription,
      images: [OG_IMAGE_PATH],
    },
  };
}

function PartnerLandingSchema({
  slug,
  partnerName,
  category,
  description,
}: {
  slug: string;
  partnerName: string;
  category: string;
  description: string;
}) {
  const origin = siteOrigin();
  const url = `${origin}/cashback/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${partnerName} cashback with GoGoCash`,
    url,
    description,
    about: {
      "@type": "Service",
      name: `${partnerName} cashback`,
      serviceType: `${category} cashback rewards`,
      provider: {
        "@type": "Organization",
        name: "GoGoCash",
        url: origin,
      },
      areaServed: ["TH", "ID", "SG", "MY", "PH", "VN"],
    },
    isPartOf: {
      "@type": "WebSite",
      name: "GoGoCash",
      url: origin,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export default async function CashbackPartnerPage({ params }: PageProps) {
  const { slug } = await params;
  const page = partnerLandingPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <PartnerLandingSchema
        slug={page.slug}
        partnerName={page.partnerName}
        category={page.category}
        description={page.metaDescription}
      />
      <PartnerLpTemplate
        partnerName={page.partnerName}
        headline={page.headline}
        description={page.description}
        bullets={page.bullets}
      />
    </>
  );
}

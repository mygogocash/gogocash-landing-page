import type { LearnArticleMeta } from "@/lib/learn-articles";
import { learnArticleDateIso } from "@/lib/learn-article-dates";
import { serializeJsonLd } from "@/lib/json-ld";
import { siteOrigin } from "@/lib/site";
import { SITE_FACTS } from "@/lib/site-facts";
import { OG_IMAGE_PATH } from "@/lib/social-preview";

type Props = { slug: string; meta: LearnArticleMeta };

/** JSON-LD Article + WebPage for `/learn/[slug]` (AEO / rich context). */
export default function LearnArticleSchema({ slug, meta }: Props) {
  const origin = siteOrigin();
  const url = `${origin}/learn/${slug}`;
  const logoUrl = `${origin}/images/gogocash-logo-mark.png`;
  const published = learnArticleDateIso(meta.published);
  const modified = learnArticleDateIso(meta.updated);

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.metaDescription,
    image: [`${origin}${OG_IMAGE_PATH}`],
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: {
      "@type": "Organization",
      name: SITE_FACTS.brandName,
      url: origin,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_FACTS.brandName,
      url: origin,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_FACTS.brandName,
      url: origin,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(article) }}
    />
  );
}

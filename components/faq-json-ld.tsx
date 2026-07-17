import { buildFaqPageSchema, type FaqSchemaItem } from "@/lib/faq-schema";
import { serializeJsonLd } from "@/lib/json-ld";

/**
 * Per-page FAQPage JSON-LD (#18). Server-rendered into the static HTML so each
 * locale home emits structured data in its own language. Render alongside the
 * visible FAQ accordion with the same items.
 */
export default function FaqJsonLd({
  items,
}: {
  items: readonly FaqSchemaItem[];
  }) {
  if (items.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(buildFaqPageSchema(items)),
      }}
    />
  );
}

import { jsonLd } from "@/seo/jsonld";

/**
 * JSON-LD Structured Data Component
 * Renders comprehensive structured data for better social media and SEO support
 */
export function JsonLdScript() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      suppressHydrationWarning
    />
  );
}

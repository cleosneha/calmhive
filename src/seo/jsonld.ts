import { siteConfig } from "./config";

/**
 * Comprehensive JSON-LD Structured Data Schema for CalmHive
 * Uses @graph approach for better social media and search engine support
 */
export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Website Schema
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      description: siteConfig.description,
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-US",
      copyrightYear: 2024,
      copyrightHolder: {
        "@id": `${siteConfig.url}/#organization`,
      },
    },
    // Software Application Schema
    {
      "@type": "SoftwareApplication",
      "@id": `${siteConfig.url}/#softwareapplication`,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      description: siteConfig.description,
      url: siteConfig.url,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
      screenshot: `${siteConfig.url}${siteConfig.ogImage}`,
      image: `${siteConfig.url}${siteConfig.ogImage}`,
      featureList: [
        "AI-powered daily planning",
        "Mindful journaling",
        "Mood tracking",
        "Task management",
        "Personal reflection",
        "Progress insights",
        "Mental wellness support",
      ],
      creator: {
        "@id": `${siteConfig.url}/#person`,
      },
      softwareVersion: "1.0.0",
      applicationSubCategory: "Productivity & Wellness",
      downloadUrl: siteConfig.url,
      installUrl: siteConfig.url,
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      license: "Proprietary",
    },
    // Organization Schema
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
        width: 512,
        height: 512,
      },
      image: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
      },
      description: siteConfig.description,
      founder: {
        "@id": `${siteConfig.url}/#person`,
      },
      foundingDate: "2024-01-01",
      sameAs: [
        siteConfig.social.github,
        siteConfig.social.linkedin,
        siteConfig.social.twitter,
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: siteConfig.author.email,
        contactType: "Customer Support",
        availableLanguage: ["English", "Hindi"],
        areaServed: "Worldwide",
      },
    },
    // Person (Creator) Schema
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      url: siteConfig.author.url,
      image: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
      },
      jobTitle: "Full Stack Developer",
      worksFor: {
        "@id": `${siteConfig.url}/#organization`,
      },
      sameAs: [
        siteConfig.author.github,
        siteConfig.author.linkedin,
        siteConfig.author.twitter,
      ],
      knowsAbout: [
        "Web Development",
        "AI Integration",
        "Mental Wellness Apps",
        "React.js",
        "Next.js",
        "TypeScript",
        "PostgreSQL",
      ],
    },
    // Breadcrumb Schema
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.url}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Journal",
          item: `${siteConfig.url}/journal`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Plan",
          item: `${siteConfig.url}/plan`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Insights",
          item: `${siteConfig.url}/insights`,
        },
      ],
    },
    // Product Schema (for better e-commerce platform support)
    {
      "@type": "Product",
      "@id": `${siteConfig.url}/#product`,
      name: siteConfig.name,
      description: siteConfig.description,
      image: `${siteConfig.url}${siteConfig.ogImage}`,
      brand: {
        "@id": `${siteConfig.url}/#organization`,
      },
      offers: {
        "@type": "Offer",
        url: siteConfig.url,
        priceCurrency: "USD",
        price: "0",
        priceValidUntil: "2025-12-31",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "150",
      },
    },
  ],
};

// Legacy function for backward compatibility
export function generateWebsiteSchema() {
  return jsonLd["@graph"].find((item) => item["@type"] === "WebSite");
}

// Organization schema
export function generateOrganizationSchema() {
  return jsonLd["@graph"].find((item) => item["@type"] === "Organization");
}

// Software Application schema
export function generateSoftwareAppSchema() {
  return jsonLd["@graph"].find(
    (item) => item["@type"] === "SoftwareApplication",
  );
}

// Breadcrumb schema
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

// Article schema (for blog/journal entries)
export function generateArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  author = siteConfig.author.name,
  url,
  image,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: image || `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    url: `${siteConfig.url}${url}`,
  };
}

// FAQ schema
export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

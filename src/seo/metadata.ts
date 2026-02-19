import { Metadata } from "next";
import { siteConfig, openGraph, twitter } from "./config";

export function generateMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}): Metadata {
  const metaTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Find Calm, Plan Mindfully`;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: [
      {
        name: siteConfig.author.name,
        url: siteConfig.author.url,
      },
    ],
    creator: siteConfig.author.name,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: metaUrl,
    },
    openGraph: {
      ...openGraph,
      title: metaTitle,
      description: metaDescription,
      url: metaUrl,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      ...twitter,
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon-images/favicon.ico" },
        { url: "/favicon-images/favicon.svg", type: "image/svg+xml" },
        {
          url: "/favicon-images/favicon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/favicon-images/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      other: [
        {
          rel: "icon",
          url: "/favicon-images/favicon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
    },
    manifest: "/favicon-images/site.webmanifest",
  };
}

// Page-specific metadata generators
export const pageMetadata = {
  home: generateMetadata({
    title: "Find Calm, Plan Mindfully",
    description:
      "A gentle, AI-powered space for planning, journaling, and reflection. No pressure, no judgment—just calm progress.",
    url: "/",
  }),

  journal: generateMetadata({
    title: "Journal",
    description:
      "Capture your thoughts, feelings, and reflections in your private journal. Track your mood and mental wellness journey.",
    url: "/user/journal",
  }),

  plan: generateMetadata({
    title: "Plan",
    description:
      "AI-powered daily and weekly planning. Organize tasks, set goals, and achieve calm productivity.",
    url: "/user/plan",
  }),

  insights: generateMetadata({
    title: "Insights",
    description:
      "Discover patterns in your mood, productivity, and wellness. Get personalized insights to improve your mental health.",
    url: "/user/insights",
  }),

  guide: generateMetadata({
    title: "Guide",
    description:
      "Learn how to make the most of CalmHive. Explore features and best practices for mindful planning and journaling.",
    url: "/guide",
  }),

  contact: generateMetadata({
    title: "Contact Us",
    description:
      "Get in touch with the CalmHive team. We're here to help with your questions and feedback.",
    url: "/contact",
  }),

  login: generateMetadata({
    title: "Login",
    description:
      "Sign in to your CalmHive account and continue your wellness journey.",
    url: "/login",
    noIndex: true,
  }),

  register: generateMetadata({
    title: "Register",
    description:
      "Create your CalmHive account and start your journey to calm productivity.",
    url: "/register",
    noIndex: true,
  }),

  onboarding: generateMetadata({
    title: "Onboarding",
    description: "Welcome to CalmHive! Let's personalize your experience.",
    url: "/onboarding",
    noIndex: true,
  }),

  settings: generateMetadata({
    title: "Settings",
    description: "Manage your CalmHive account settings and preferences.",
    url: "/user/settings",
    noIndex: true,
  }),

  privacyPolicy: generateMetadata({
    title: "Privacy Policy",
    description:
      "Learn how CalmHive protects your privacy and handles your personal data. Your privacy is our priority.",
    url: "/privacy-policy",
  }),

  termsOfService: generateMetadata({
    title: "Terms of Service",
    description: "Read CalmHive's terms of service and user agreement.",
    url: "/terms-of-service",
  }),
};

export const siteConfig = {
  name: "CalmHive",
  shortName: "CalmHive",
  description:
    "A gentle, AI-powered space for planning, journaling, and reflection. No pressure, no judgment—just calm progress.",
  url: "https://calmhive.vercel.app",
  ogImage: "/og-calmhive.png",
  logo: "/calmhive.png",
  keywords: [
    "mental wellness",
    "journaling",
    "daily planning",
    "mindfulness",
    "AI-powered planner",
    "productivity",
    "self-care",
    "mental health",
    "personal growth",
    "life planning",
    "task management",
    "mood tracking",
    "reflection",
    "wellness app",
  ],
  author: {
    name: "Sneha Sharma",
    email: "cleosneha@gmail.com",
    url: "https://snehasharma.me",
    github: "https://github.com/cleosneha",
    linkedin: "https://linkedin.com/in/cleosneha",
    twitter: "https://x.com/cleosneha",
  },
  social: {
    github: "https://github.com/cleosneha",
    linkedin: "https://linkedin.com/in/cleosneha",
    twitter: "https://x.com/cleosneha",
  },
  creator: "@cleosneha",
  themeColor: "#ffffff",
  backgroundColor: "#ffffff",
};

export const openGraph = {
  type: "website" as const,
  locale: "en_US",
  url: siteConfig.url,
  siteName: siteConfig.name,
  title: `${siteConfig.name} - Find Calm, Plan Mindfully`,
  description: siteConfig.description,
  images: [
    {
      url: `${siteConfig.url}${siteConfig.ogImage}`,
      width: 1200,
      height: 630,
      alt: siteConfig.name,
      type: "image/png",
    },
  ],
};

export const twitter = {
  card: "summary_large_image" as const,
  site: siteConfig.creator,
  creator: siteConfig.creator,
  title: `${siteConfig.name} - Find Calm, Plan Mindfully`,
  description: siteConfig.description,
  images: [siteConfig.ogImage],
};

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/*",
          "/user/*",
          "/onboarding/*",
          "/_next/*",
          "/admin/*",
          "/*.json$",
          "/*?*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/*", "/user/*", "/onboarding/*", "/_next/*"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/*", "/user/*", "/onboarding/*", "/_next/*"],
      },
    ],
    sitemap: "https://calmhive.vercel.app/sitemap.xml",
  };
}

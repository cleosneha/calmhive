/**
 * Utility functions for SEO
 */

export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function generateCanonicalUrl(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl);
  return url.toString();
}

export function removeTrailingSlash(url: string): string {
  return url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
}

export function sanitizeTitle(title: string): string {
  return title.replace(/[<>]/g, "").trim();
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}

export function generateMetaTags(data: {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  url?: string;
  image?: string;
}) {
  return {
    title: sanitizeTitle(data.title),
    description: truncateDescription(data.description),
    keywords: data.keywords?.join(", "),
    author: data.author,
    url: data.url,
    image: data.image,
  };
}

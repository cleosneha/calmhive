/**
 * SEO Types for CalmHive
 * Type definitions for SEO-related functionality
 */

export interface PageSEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleSEO {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
  image?: string;
}

export interface SocialMetadata {
  siteName: string;
  title: string;
  description: string;
  url: string;
  image: string;
}

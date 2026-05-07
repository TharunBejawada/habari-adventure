/**
 * apps/web/lib/seo.ts
 *
 * Server-safe SEO utilities. All functions work in both server and client contexts.
 * No DOM APIs are used — safe for Next.js server components and generateMetadata.
 */

/** Strip HTML tags from rich-text content (server-safe, no DOMParser). */
export function stripHtmlForSeo(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate a string to maxLen characters, appending "…" only when cut. */
export function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  const clean = text.trim();
  return clean.length <= maxLen ? clean : clean.substring(0, maxLen - 1) + "…";
}

// ─── Structured Data Generators ───────────────────────────────────────────────

/**
 * Builds a Schema.org TouristDestination JSON-LD object for a Location page.
 */
export function buildLocationJsonLd(loc: {
  title: string;
  overviewText?: string;
  bannerImage?: string;
  heroImage?: string;
  category?: string;
}, pageUrl: string): Record<string, unknown> {
  const description = truncate(stripHtmlForSeo(loc.overviewText || ""), 300);
  const image = loc.bannerImage || loc.heroImage;

  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": loc.title,
    ...(description && { "description": description }),
    "url": pageUrl,
    ...(image && { "image": image }),
    ...(loc.category && { "touristType": { "@type": "Audience", "audienceType": loc.category } }),
    "provider": {
      "@type": "TravelAgency",
      "name": "Habari Adventure",
      "url": pageUrl.split("/").slice(0, 3).join("/"),
    },
  };
}

/**
 * Builds a Schema.org Product + Offer JSON-LD object for a Package page.
 */
export function buildPackageJsonLd(pkg: {
  title: string;
  description?: string;
  bannerImage?: string;
  category?: string;
  location?: string;
}, pageUrl: string, pricing?: { tier2?: number } | null): Record<string, unknown> {
  const description = truncate(stripHtmlForSeo(pkg.description || ""), 300);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pkg.title,
    ...(description && { "description": description }),
    "url": pageUrl,
    ...(pkg.bannerImage && { "image": pkg.bannerImage }),
    "brand": { "@type": "Brand", "name": "Habari Adventure" },
    ...(pkg.category && { "category": pkg.category }),
  };

  if (pricing?.tier2) {
    schema.offers = {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": pricing.tier2,
      "availability": "https://schema.org/InStock",
      "url": pageUrl,
      "seller": { "@type": "TravelAgency", "name": "Habari Adventure" },
    };
  }

  return schema;
}

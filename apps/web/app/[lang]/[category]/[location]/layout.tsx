// apps/web/app/[lang]/[category]/[location]/layout.tsx
// Server component — generates SEO metadata for location pages.
// Also wraps package detail pages; the nested [...packageSlug]/layout.tsx
// overrides these values for package routes.

import type { Metadata } from "next";
import { cache } from "react";
import { stripHtmlForSeo, truncate, buildLocationJsonLd, buildFaqJsonLd } from "../../../../lib/seo";
import { normalizeSlugPath } from "../../../../lib/slugify";
import { getLangPrefix } from "../../../../lib/languages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Cached data fetch (deduped per render cycle) ─────────────────────────────

const fetchLocationData = cache(async (slug: string, lang: string) => {
  try {
    // SSR requires an absolute URL. Ensure this env variable includes "https://" or "http://"
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    
    const encodedSlug = slug.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${base}/locations/${encodedSlug}?lang=${lang}`,
      { cache: "no-store" }
    );
    
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    
    const json = JSON.parse(text);
    
    // FIX: Client wrappers like `apiFetch` often append `.data`. 
    // This ensures we return the data whether it's wrapped in { data: ... } or returned directly.
    return json?.data ?? json ?? null;
  } catch (error) {
    console.error("Layout Fetch Error:", error);
    return null;
  }
});

// ─── generateMetadata ─────────────────────────────────────────────────────────

type Params = Promise<{ lang: string; category: string; location: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  
  // FIX: Decode params to ensure DB slug matches correctly
  const category = decodeURIComponent(resolvedParams.category);
  const location = decodeURIComponent(resolvedParams.location);
  
  const fullDbSlug = `${category}/${location}`;
  
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}${getLangPrefix(lang)}/${normCategory}/${normLocation}`;

  const loc = await fetchLocationData(fullDbSlug, lang);
  const fallbackTitle = location.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (!loc) {
    return {
      title: `${fallbackTitle} | Habari Adventure`,
      description: "Explore this destination with Habari Adventure. Discover curated routes and adventures.",
      robots: "index, follow",
    };
  }

  // FIX: Make fallback logic more robust if loc exists but specific fields are empty
  const title = loc.metaTitle || (loc.title ? `${loc.title} | Habari Adventure` : `${fallbackTitle} | Habari Adventure`);
  const rawDesc = loc.overviewText ? stripHtmlForSeo(loc.overviewText) : "";
  const description = loc.metaDescription || (rawDesc ? truncate(rawDesc, 160) : "Explore this destination with Habari Adventure.");
  const image = loc.ogImage || loc.bannerImage || loc.heroImage || "";
  const canonical = loc.canonicalUrl || pageUrl;
  const robots = loc.robots || "index, follow";

  return {
    title,
    description,
    ...(loc.metaKeywords && { keywords: loc.metaKeywords }),
    alternates: { canonical },
    robots,
    openGraph: {
      title: loc.ogTitle || title,
      description: loc.ogDescription || description,
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
      ...(image && { images: [{ url: image, alt: loc.title || fallbackTitle }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: loc.twitterTitle || title,
      description: loc.twitterDescription || description,
      ...(loc.twitterImage
        ? { images: [loc.twitterImage] }
        : image
        ? { images: [image] }
        : {}),
    },
  };
}

// ─── Layout component ─────────────────────────────────────────────────────────

export default async function LocationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const category = decodeURIComponent(resolvedParams.category);
  const location = decodeURIComponent(resolvedParams.location);
  
  const fullDbSlug = `${category}/${location}`;
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}${getLangPrefix(lang)}/${normCategory}/${normLocation}`;

  const loc = await fetchLocationData(fullDbSlug, lang);

  // 2. Generate schemas
  const jsonLd = loc ? (loc.structuredData ?? buildLocationJsonLd(loc, pageUrl)) : null;
  const faqJsonLd = loc?.faqs ? buildFaqJsonLd(loc.faqs) : null; // <-- NEW

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* 3. Inject FAQ Schema */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
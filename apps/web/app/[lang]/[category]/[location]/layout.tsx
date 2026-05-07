// apps/web/app/[lang]/[category]/[location]/layout.tsx
// Server component — generates SEO metadata for location pages.
// Also wraps package detail pages; the nested [...packageSlug]/layout.tsx
// overrides these values for package routes.

import type { Metadata } from "next";
import { cache } from "react";
import { stripHtmlForSeo, truncate, buildLocationJsonLd } from "../../../../lib/seo";
import { normalizeSlugPath } from "../../../../lib/slugify";

// ─── Cached data fetch (deduped per render cycle) ─────────────────────────────

const fetchLocationData = cache(async (slug: string, lang: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    const encodedSlug = slug.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${base}/locations/${encodedSlug}?lang=${lang}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const json = JSON.parse(text);
    return json?.data ?? null;
  } catch {
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
  const { lang, category, location } = await params;
  const fullDbSlug = `${category}/${location}`;
  // Normalize so canonical URLs never contain spaces or encoded chars
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}`;

  const loc = await fetchLocationData(fullDbSlug, lang);

  if (!loc) {
    const fallbackTitle = location.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `${fallbackTitle} | Habari Adventure`,
      description: "Explore this destination with Habari Adventure. Discover curated routes and adventures.",
      robots: "index, follow",
    };
  }

  const title = loc.metaTitle || `${loc.title} | Habari Adventure`;
  const rawDesc = stripHtmlForSeo(loc.overviewText ?? "");
  const description = loc.metaDescription || truncate(rawDesc, 160);
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
      ...(image && { images: [{ url: image, alt: loc.title }] }),
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
  const { lang, category, location } = await params;
  const fullDbSlug = `${category}/${location}`;
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}`;

  const loc = await fetchLocationData(fullDbSlug, lang);

  // Build JSON-LD — use admin-provided structuredData if present, else auto-generate
  const jsonLd = loc
    ? (loc.structuredData ?? buildLocationJsonLd(loc, pageUrl))
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}

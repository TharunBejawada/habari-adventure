// apps/web/app/[lang]/[category]/[location]/[...packageSlug]/layout.tsx
// Server component — generates SEO metadata for package detail pages.
// Overrides the parent [location]/layout.tsx metadata for package routes.

import type { Metadata } from "next";
import { cache } from "react";
import { stripHtmlForSeo, truncate, buildPackageJsonLd } from "../../../../../lib/seo";
import { normalizeSlugPath } from "../../../../../lib/slugify";

// ─── Cached data fetches ──────────────────────────────────────────────────────

const fetchPackageData = cache(async (slug: string, lang: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    const encodedSlug = slug.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${base}/packages/${encodedSlug}?lang=${lang}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const json = JSON.parse(text);
    const pkg = json?.data;
    return pkg?.isPublished ? pkg : null;
  } catch {
    return null;
  }
});

const fetchPricingData = cache(async (packageId: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    const res = await fetch(`${base}/pricing`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const json = JSON.parse(text);
    const list: any[] = Array.isArray(json?.data) ? json.data : [];
    return list.find((p) => p.packageId === packageId) ?? null;
  } catch {
    return null;
  }
});

// ─── generateMetadata ─────────────────────────────────────────────────────────

type Params = Promise<{
  lang: string;
  category: string;
  location: string;
  packageSlug: string[];
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang, category, location, packageSlug } = await params;
  const pkgParam = (packageSlug ?? []).map((p) => decodeURIComponent(p)).join("/");
  const fullDbSlug = `${category}/${location}/${pkgParam}`;
  // Normalize so canonical URLs never contain spaces or encoded chars
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const normPkgParam = normalizeSlugPath(pkgParam);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}/${normPkgParam}`;

  const pkg = await fetchPackageData(fullDbSlug, lang);

  if (!pkg) {
    return {
      title: "Adventure Package | Habari Adventure",
      description: "Explore adventure packages with Habari Adventure.",
      robots: "noindex, follow",
    };
  }

  const rawDesc = stripHtmlForSeo(pkg.description ?? "");
  const title = pkg.metaTitle || `${pkg.title} | Habari Adventure`;
  const description = pkg.metaDescription || truncate(rawDesc, 160);
  const image = pkg.ogImage || pkg.bannerImage || "";
  const canonical = pkg.canonicalUrl || pageUrl;
  const robots = pkg.robots || "index, follow";

  return {
    title,
    description,
    ...(pkg.metaKeywords && { keywords: pkg.metaKeywords }),
    alternates: { canonical },
    robots,
    openGraph: {
      title: pkg.ogTitle || title,
      description: pkg.ogDescription || description,
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
      ...(image && { images: [{ url: image, alt: pkg.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: pkg.twitterTitle || title,
      description: pkg.twitterDescription || description,
      ...(pkg.twitterImage
        ? { images: [pkg.twitterImage] }
        : image
        ? { images: [image] }
        : {}),
    },
  };
}

// ─── Layout component ─────────────────────────────────────────────────────────

export default async function PackageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { lang, category, location, packageSlug } = await params;
  const pkgParam = (packageSlug ?? []).map((p) => decodeURIComponent(p)).join("/");
  const fullDbSlug = `${category}/${location}/${pkgParam}`;
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const normPkgParam = normalizeSlugPath(pkgParam);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}/${normPkgParam}`;

  const pkg = await fetchPackageData(fullDbSlug, lang);

  let jsonLd: Record<string, unknown> | null = null;
  if (pkg) {
    if (pkg.structuredData) {
      jsonLd = pkg.structuredData;
    } else {
      const pricing = await fetchPricingData(pkg.id);
      jsonLd = buildPackageJsonLd(pkg, pageUrl, pricing);
    }
  }

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

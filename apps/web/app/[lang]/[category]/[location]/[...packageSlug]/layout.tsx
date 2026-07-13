// apps/web/app/[lang]/[category]/[location]/[...packageSlug]/layout.tsx
// Server component — generates SEO metadata for package detail pages.
// Overrides the parent [location]/layout.tsx metadata for package routes.

import type { Metadata } from "next";
import { cache } from "react";
import { stripHtmlForSeo, truncate, buildPackageJsonLd, buildFaqJsonLd } from "../../../../../lib/seo";
import { normalizeSlugPath } from "../../../../../lib/slugify";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Cached data fetches ──────────────────────────────────────────────────────

const fetchPackageData = cache(async (slug: string, lang: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    const encodedSlug = slug.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${base}/packages/${encodedSlug}?lang=${lang}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const json = JSON.parse(text);
    
    // FIX: Safely fallback to the root JSON object if `.data` is undefined
    const pkg = json?.data ?? json;
    return pkg?.isPublished ? pkg : null;
  } catch (error) {
    console.error("Package Layout Fetch Error:", error);
    return null;
  }
});

const fetchPricingData = cache(async (packageId: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    const res = await fetch(`${base}/pricing`, { cache: "no-store" });
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
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  
  // FIX: Decode ALL parameters to construct an accurate database slug
  const category = decodeURIComponent(resolvedParams.category);
  const location = decodeURIComponent(resolvedParams.location);
  const pkgParam = (resolvedParams.packageSlug ?? []).map((p) => decodeURIComponent(p)).join("/");
  
  const fullDbSlug = `${category}/${location}/${pkgParam}`;
  
  // Normalize so canonical URLs never contain spaces or encoded chars
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const normPkgParam = normalizeSlugPath(pkgParam);
  
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}/${normPkgParam}`;

  const pkg = await fetchPackageData(fullDbSlug, lang);

  if (!pkg) {
    const fallbackTitle = pkgParam.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `${fallbackTitle} | Habari Adventure`,
      description: "Explore adventure packages with Habari Adventure.",
      robots: "noindex, follow",
    };
  }

  const rawDesc = stripHtmlForSeo(pkg.description ?? "");
  const title = pkg.metaTitle || `${pkg.title} | Habari Adventure`;
  const description = pkg.metaDescription || (rawDesc ? truncate(rawDesc, 160) : "Explore adventure packages with Habari Adventure.");
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
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const category = decodeURIComponent(resolvedParams.category);
  const location = decodeURIComponent(resolvedParams.location);
  const pkgParam = (resolvedParams.packageSlug ?? []).map((p) => decodeURIComponent(p)).join("/");
  
  const fullDbSlug = `${category}/${location}/${pkgParam}`;
  const normCategory = normalizeSlugPath(category);
  const normLocation = normalizeSlugPath(location);
  const normPkgParam = normalizeSlugPath(pkgParam);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/${normCategory}/${normLocation}/${normPkgParam}`;

  const pkg = await fetchPackageData(fullDbSlug, lang);

  // 2. Generate schemas
  let jsonLd: Record<string, unknown> | null = null;
  if (pkg) {
    if (pkg.structuredData) {
      jsonLd = pkg.structuredData;
    } else {
      const pricing = await fetchPricingData(pkg.id);
      jsonLd = buildPackageJsonLd(pkg, pageUrl, pricing);
    }
  }
  
  const faqJsonLd = pkg?.faqs ? buildFaqJsonLd(pkg.faqs) : null; // <-- NEW

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
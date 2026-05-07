// apps/web/app/[lang]/blog/[slug]/layout.tsx
// Server component — generates SEO metadata for individual blog posts.

import type { Metadata } from "next";
import { cache } from "react";
import { normalizeSlugPath } from "../../../../lib/slugify";


const fetchBlogData = cache(async (slug: string, lang: string) => {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;
    
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetch(
      `${base}/blogs/${encodedSlug}?lang=${lang}`,
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

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  
  // Normalize so canonical URLs never contain spaces or encoded chars
  const normSlug = normalizeSlugPath(slug);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/blog/${normSlug}`;

  const blog = await fetchBlogData(slug, lang);

  // Fallback if the blog isn't found in the database
  if (!blog) {
    const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      title: `${fallbackTitle} | Habari Adventure Blog`,
      description: "Read the latest updates, tips, and stories from Habari Adventure.",
      robots: "index, follow",
    };
  }

  // Map the strict database fields
  const title = blog.metaTitle || `${blog.title || slug} | Habari Adventure`;
  const description = blog.metaDescription || "Read the latest updates, tips, and stories from Habari Adventure.";

  return {
    title,
    description,
    ...(blog.metaKeywords && { keywords: blog.metaKeywords }),
    alternates: { canonical: pageUrl },
    robots: "index, follow", // Hardcoded default since it's not saved in the DB
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article", // Automatically formats this as a blog post for social media
      siteName: "Habari Adventure",
    },
    twitter: {
      card: "summary", // Standard text-only summary card
      title,
      description,
    },
  };
}

// ─── Layout component ─────────────────────────────────────────────────────────

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { lang, slug } = await params;
  const normSlug = normalizeSlugPath(slug);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/blog/${normSlug}`;

  const blog = await fetchBlogData(slug, lang);

  // Auto-generate basic Article JSON-LD since custom structuredData isn't in the DB
  const jsonLd = blog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.metaTitle || blog.title || slug,
    "description": blog.metaDescription,
    "url": pageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Habari Adventure",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    }
  } : null;

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
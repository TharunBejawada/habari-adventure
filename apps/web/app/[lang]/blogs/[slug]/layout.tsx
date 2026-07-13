// apps/web/app/[lang]/blog/[slug]/layout.tsx
// Server component — generates SEO metadata for individual blog posts.

import type { Metadata } from "next";
import { cache } from "react";
import { normalizeSlugPath } from "../../../../lib/slugify";
import { buildFaqJsonLd } from "../../../../lib/seo";


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
    
    // FIX: Safely fallback to the root JSON object if `.data` is undefined
    return json?.data ?? json ?? null;
  } catch (error) {
    console.error("Blog Layout Fetch Error:", error);
    return null;
  }
});

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  
  // FIX: Decode the slug parameter
  const slug = decodeURIComponent(resolvedParams.slug);
  
  // Normalize so canonical URLs never contain spaces or encoded chars
  const normSlug = normalizeSlugPath(slug);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/blog/${normSlug}`;

  const blog = await fetchBlogData(slug, lang);
  const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Fallback if the blog isn't found in the database
  if (!blog) {
    return {
      title: `${fallbackTitle} | Habari Adventure Blog`,
      description: "Read the latest updates, tips, and stories from Habari Adventure.",
      robots: "index, follow",
    };
  }

  // FIX: Map the strict database fields with better fallbacks utilizing excerpt & featuredImage
  const title = blog.metaTitle || (blog.title ? `${blog.title} | Habari Adventure` : `${fallbackTitle} | Habari Adventure`);
  const description = blog.metaDescription || blog.excerpt || "Read the latest updates, tips, and stories from Habari Adventure.";
  const image = blog.featuredImage || "";

  return {
    title,
    description,
    ...(blog.metaKeywords && { keywords: blog.metaKeywords }),
    alternates: { canonical: pageUrl },
    robots: "index, follow", 
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article", 
      siteName: "Habari Adventure",
      ...(image && { images: [{ url: image, alt: blog.imageAltText || blog.title || fallbackTitle }] }),
    },
    twitter: {
      card: "summary_large_image", // Better display for featured images on X/Twitter
      title,
      description,
      ...(image && { images: [image] }),
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
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const slug = decodeURIComponent(resolvedParams.slug);
  
  const normSlug = normalizeSlugPath(slug);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const pageUrl = `${siteUrl}/${lang}/blog/${normSlug}`;

  const blog = await fetchBlogData(slug, lang);

  // 2. Generate schemas
  const jsonLd = blog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.metaTitle || blog.title || slug,
    "description": blog.metaDescription || blog.excerpt,
    "image": blog.featuredImage ? [blog.featuredImage] : undefined,
    "url": pageUrl,
    "author": {
      "@type": "Person",
      "name": blog.authorName || "Habari Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Habari Adventure",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "datePublished": blog.publishedAt,
    "dateModified": blog.updatedAt || blog.publishedAt
  } : null;

  const faqJsonLd = blog?.faqs ? buildFaqJsonLd(blog.faqs) : null; // <-- NEW

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
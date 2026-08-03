// apps/web/app/[lang]/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { apiFetch } from '../../../lib/apiClient'; // Verify this import path

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  // 1. Update the type to be a Promise
  { params }: { params: Promise<{ lang: string }> } 
) {
  // 2. Await the params before extracting lang!
  const { lang } = await params; 
  const BASE_URL = 'https://habariadventure.com';

  // ==========================================
  // 1. Static Routes Configuration
  // ==========================================
  const staticPaths = [
    '', // Home page
    '/about',
    '/blogs',
    '/booking-policy',
    '/contact',
    '/crew',
    '/departures',
    '/equipment',
    '/gallery',
    '/services',
    '/sustainability',
  ];

  let sitemapUrls = staticPaths.map((path) => ({
    url: `${BASE_URL}/${lang}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // ==========================================
  // 2. Fetch Dynamic Data Concurrently
  // ==========================================
  const [blogsResult, locationsResult, packagesResult] = await Promise.allSettled([
    apiFetch(`/blogs?publishedOnly=true&lang=${lang}`),
    apiFetch(`/locations?lang=${lang}`),
    apiFetch(`/packages?lang=${lang}`)
  ]);

  // --- Process Blogs ---
  if (blogsResult.status === 'fulfilled' && blogsResult.value.ok && Array.isArray(blogsResult.value.data)) {
    const blogs = blogsResult.value.data.map((blog: any) => {
      const slug = blog.slug.startsWith('/') ? blog.slug : `/${blog.slug}`;
      return {
        url: `${BASE_URL}/${lang}/blogs${slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
    sitemapUrls.push(...blogs);
  } else if (blogsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Blogs Fetch]:', blogsResult.reason);
  }

  // --- Process Locations ---
  if (locationsResult.status === 'fulfilled' && locationsResult.value.ok && Array.isArray(locationsResult.value.data)) {
    const locations = locationsResult.value.data.map((location: any) => {
      const slug = location.slug.startsWith('/') ? location.slug : `/${location.slug}`;
      return {
        url: `${BASE_URL}/${lang}${slug}`,
        lastModified: new Date(location.updatedAt || location.createdAt || new Date()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
    sitemapUrls.push(...locations);
  } else if (locationsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Locations Fetch]:', locationsResult.reason);
  }

  // --- Process Packages ---
  if (packagesResult.status === 'fulfilled' && packagesResult.value.ok && Array.isArray(packagesResult.value.data)) {
    const packages = packagesResult.value.data
      .filter((pkg: any) => pkg.isPublished !== false)
      .map((pkg: any) => {
        const slug = pkg.slug.startsWith('/') ? pkg.slug : `/${pkg.slug}`;
        return {
          url: `${BASE_URL}/${lang}${slug}`,
          lastModified: new Date(pkg.updatedAt || pkg.createdAt || new Date()).toISOString(),
          changeFrequency: 'weekly',
          priority: 0.9,
        };
      });
    sitemapUrls.push(...packages);
  } else if (packagesResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Packages Fetch]:', packagesResult.reason);
  }

  // ==========================================
  // 3. Construct the XML Response
  // ==========================================
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(
  (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      // Tell search engines & CDNs to cache this for 1 hour
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', 
    },
  });
}
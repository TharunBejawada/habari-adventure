// apps/web/lib/sitemap.ts
// Shared URL-building logic for the root sitemap (English) and the
// per-language sitemap route (used by fr, es, and en-if-visited-directly).
import { apiFetch } from './apiClient';

export type SitemapChangeFreq = 'daily' | 'weekly' | 'monthly';

export interface SitemapPath {
  /** Path relative to the language root, starting with '/' (or '' for the homepage) */
  path: string;
  lastModified: string;
  changeFrequency: SitemapChangeFreq;
  priority: number;
}

const STATIC_PATHS: Array<{ path: string; changeFrequency: SitemapChangeFreq; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/blogs', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/booking-policy', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/crew', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/departures', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/equipment', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sustainability', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/thank-you', changeFrequency: 'monthly', priority: 0.3 },
];

export async function buildSitemapPaths(lang: string): Promise<SitemapPath[]> {
  const now = new Date().toISOString();
  const paths: SitemapPath[] = STATIC_PATHS.map((p) => ({ ...p, lastModified: now }));

  const [blogsResult, locationsResult, packagesResult] = await Promise.allSettled([
    apiFetch(`/blogs?publishedOnly=true&lang=${lang}`),
    apiFetch(`/locations?lang=${lang}`),
    apiFetch(`/packages?lang=${lang}`),
  ]);

  if (blogsResult.status === 'fulfilled' && blogsResult.value.ok && Array.isArray(blogsResult.value.data)) {
    for (const blog of blogsResult.value.data) {
      const slug = blog.slug.startsWith('/') ? blog.slug : `/${blog.slug}`;
      paths.push({
        path: `/blogs${slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } else if (blogsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Blogs Fetch]:', blogsResult.reason);
  }

  if (locationsResult.status === 'fulfilled' && locationsResult.value.ok && Array.isArray(locationsResult.value.data)) {
    for (const location of locationsResult.value.data) {
      const slug = location.slug.startsWith('/') ? location.slug : `/${location.slug}`;
      paths.push({
        path: slug,
        lastModified: new Date(location.updatedAt || location.createdAt || new Date()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } else if (locationsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Locations Fetch]:', locationsResult.reason);
  }

  if (packagesResult.status === 'fulfilled' && packagesResult.value.ok && Array.isArray(packagesResult.value.data)) {
    const published = packagesResult.value.data.filter((pkg: any) => pkg.isPublished !== false);
    for (const pkg of published) {
      const slug = pkg.slug.startsWith('/') ? pkg.slug : `/${pkg.slug}`;
      paths.push({
        path: slug,
        lastModified: new Date(pkg.updatedAt || pkg.createdAt || new Date()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  } else if (packagesResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Packages Fetch]:', packagesResult.reason);
  }

  return paths;
}

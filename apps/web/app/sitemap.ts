// apps/web/app/sitemap.ts
import { MetadataRoute } from 'next';
import { apiFetch } from '../lib/apiClient'; // Verify this import path fits your workspace structure

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://habariadventure.com';
  const lang = 'en';

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

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}/${lang}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Containers for dynamic routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  let locationRoutes: MetadataRoute.Sitemap = [];
  let packageRoutes: MetadataRoute.Sitemap = [];

  // ==========================================
  // 2. Fetch Dynamic Data Concurrently
  // ==========================================
  const [blogsResult, locationsResult, packagesResult] = await Promise.allSettled([
    apiFetch(`/blogs?publishedOnly=true&lang=${lang}`),
    // Standard endpoint patterns mapping to your entity collections
    apiFetch(`/locations?lang=${lang}`),
    apiFetch(`/packages?lang=${lang}`)
  ]);

  // --- Process Blogs ---
  if (blogsResult.status === 'fulfilled' && blogsResult.value.ok && Array.isArray(blogsResult.value.data)) {
    blogRoutes = blogsResult.value.data.map((blog: any) => {
      const slug = blog.slug.startsWith('/') ? blog.slug : `/${blog.slug}`;
      return {
        url: `${BASE_URL}/${lang}/blogs${slug}`,
        lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
  } else if (blogsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Blogs Fetch]:', blogsResult.reason);
  }

  // --- Process Locations ---
  if (locationsResult.status === 'fulfilled' && locationsResult.value.ok && Array.isArray(locationsResult.value.data)) {
    locationRoutes = locationsResult.value.data.map((location: any) => {
      // Dynamic route path configuration matching your dynamic page component parameters:
      // /[lang]/[category]/[location]
      const slug = location.slug.startsWith('/') ? location.slug : `/${location.slug}`;
      return {
        url: `${BASE_URL}/${lang}${slug}`,
        lastModified: new Date(location.updatedAt || location.createdAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
  } else if (locationsResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Locations Fetch]:', locationsResult.reason);
  }

  // --- Process Packages ---
  if (packagesResult.status === 'fulfilled' && packagesResult.value.ok && Array.isArray(packagesResult.value.data)) {
    packageRoutes = packagesResult.value.data
      .filter((pkg: any) => pkg.isPublished !== false)
      .map((pkg: any) => {
        // Dynamic route matching your dynamic package view configuration structure:
        // /[lang]/[category]/[location]/[package]
        const slug = pkg.slug.startsWith('/') ? pkg.slug : `/${pkg.slug}`;
        return {
          url: `${BASE_URL}/${lang}${slug}`,
          lastModified: new Date(pkg.updatedAt || pkg.createdAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.9,
        };
      });
  } else if (packagesResult.status === 'rejected') {
    console.error('Sitemap Execution Error [Packages Fetch]:', packagesResult.reason);
  }

  // ==========================================
  // 3. Compile Data Sets
  // ==========================================
  return [
    ...staticRoutes,
    ...blogRoutes,
    ...locationRoutes,
    ...packageRoutes,
  ];
}
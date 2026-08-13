// apps/web/app/sitemap.ts
// The default language (English) has no URL prefix, so its sitemap content
// lives directly at the root /sitemap.xml. French and Spanish keep their own
// standalone sitemaps at /fr/sitemap.xml and /es/sitemap.xml (see
// app/[lang]/sitemap.xml/route.ts) - they are not referenced from this file.
import { MetadataRoute } from 'next';
import { buildSitemapPaths } from '../lib/sitemap';
import { DEFAULT_LANGUAGE } from '../lib/languages';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://habariadventure.com';
  const paths = await buildSitemapPaths(DEFAULT_LANGUAGE);

  return paths.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: p.lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}

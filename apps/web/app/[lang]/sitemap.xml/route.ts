// apps/web/app/[lang]/sitemap.xml/route.ts
// Serves the per-language sitemap for non-default languages (/fr/sitemap.xml,
// /es/sitemap.xml). English content lives at the root /sitemap.xml instead
// (see app/sitemap.ts); this route still works if /en/sitemap.xml is hit
// directly, since dot-paths bypass the default-language redirect in
// middleware.ts.
import { NextResponse } from 'next/server';
import { buildSitemapPaths } from '../../../lib/sitemap';
import { getLangPrefix } from '../../../lib/languages';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const BASE_URL = 'https://habariadventure.com';

  const paths = await buildSitemapPaths(lang);
  const prefix = getLangPrefix(lang);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(
  (p) => `  <url>
    <loc>${BASE_URL}${prefix}${p.path}</loc>
    <lastmod>${p.lastModified}</lastmod>
    <changefreq>${p.changeFrequency}</changefreq>
    <priority>${p.priority}</priority>
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

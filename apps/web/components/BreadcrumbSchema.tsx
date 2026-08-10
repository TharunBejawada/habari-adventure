// apps/web/components/BreadcrumbSchema.tsx
'use client';

import { usePathname } from 'next/navigation';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../lib/languages';

export default function BreadcrumbSchema() {
  const pathname = usePathname();

  // If there's no pathname available, don't render anything
  if (!pathname) return null;

  const BASE_URL = 'https://habariadventure.com';

  // Split the path into segments and remove empty strings
  const pathSegments = pathname.split('/').filter(Boolean);

  // Only non-default languages carry a URL prefix (e.g. /fr, /es).
  // The default language ("en") has no prefix, so its first segment is
  // a real path segment, not a language code.
  const hasLangPrefix = SUPPORTED_LANGUAGES.some(
    (l) => l.code !== DEFAULT_LANGUAGE && l.code === pathSegments[0]
  );
  const langPrefix = hasLangPrefix ? `/${pathSegments[0]}` : '';
  const restSegments = hasLangPrefix ? pathSegments.slice(1) : pathSegments;

  const itemListElement = [];

  // 1. Always add the Language root as "Home"
  itemListElement.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": `${BASE_URL}${langPrefix || '/'}`
  });

  // 2. Loop through the rest of the URL segments to build the breadcrumb chain
  let currentPath = langPrefix;
  for (let i = 0; i < restSegments.length; i++) {
    const segment = restSegments[i];
    if (!segment) continue;
    currentPath += `/${segment}`;

    // Format the segment to be readable (e.g., "booking-policy" -> "Booking Policy")
    const formattedName = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    itemListElement.push({
      "@type": "ListItem",
      "position": i + 2,
      "name": formattedName,
      "item": `${BASE_URL}${currentPath}`
    });
  }

  // 3. Construct the final schema object
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
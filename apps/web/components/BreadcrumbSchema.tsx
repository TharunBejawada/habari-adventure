// apps/web/components/BreadcrumbSchema.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function BreadcrumbSchema() {
  const pathname = usePathname();

  // If there's no pathname available, don't render anything
  if (!pathname) return null;

  const BASE_URL = 'https://habariadventure.com';

  // Split the path into segments and remove empty strings
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Default to 'en' if accessed at the absolute root without a language param
  const lang = pathSegments[0] || 'en';

  const itemListElement = [];

  // 1. Always add the Language root as "Home"
  itemListElement.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": `${BASE_URL}/${lang}`
  });

  // 2. Loop through the rest of the URL segments to build the breadcrumb chain
  let currentPath = `/${lang}`;
  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    if (!segment) continue;
    currentPath += `/${segment}`;

    // Format the segment to be readable (e.g., "booking-policy" -> "Booking Policy")
    const formattedName = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    itemListElement.push({
      "@type": "ListItem",
      "position": i + 1,
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
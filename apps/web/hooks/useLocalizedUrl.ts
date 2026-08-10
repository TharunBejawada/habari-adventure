"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLangPrefix } from "../lib/languages";

export function useLocalizedUrl() {
  const pathname = usePathname();

  // 1. Extract current language from URL. Only non-default languages carry a
  // URL prefix (e.g. /fr, /es) - the default language has none, so its first
  // segment is a real path segment, not a language code.
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  const currentLang = SUPPORTED_LANGUAGES.some(l => l.code !== DEFAULT_LANGUAGE && l.code === pathSegments[0])
    ? pathSegments[0]
    : DEFAULT_LANGUAGE;

  // 2. The centralized function
  const getLocalizedUrl = (url: string | undefined | null): string => {
    // Ignore external links, anchor tags, emails, and phone numbers
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url || "#";
    }

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    // Prevent double prefixes if the DB already returned /fr/packages
    if (SUPPORTED_LANGUAGES.some(l => cleanUrl.startsWith(`/${l.code}/`) || cleanUrl === `/${l.code}`)) {
      return cleanUrl;
    }

    const prefix = getLangPrefix(currentLang);
    if (cleanUrl === '/') return prefix || '/';

    return `${prefix}${cleanUrl}`;
  };

  return { getLocalizedUrl, currentLang };
}
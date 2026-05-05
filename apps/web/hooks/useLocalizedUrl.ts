"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../lib/languages";

export function useLocalizedUrl() {
  const pathname = usePathname();

  // 1. Extract current language from URL
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  const currentLang = SUPPORTED_LANGUAGES.some(l => l.code === pathSegments[0]) 
    ? pathSegments[0] 
    : DEFAULT_LANGUAGE;

  // 2. The centralized function
  const getLocalizedUrl = (url: string) => {
    // Ignore external links, anchor tags, emails, and phone numbers
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Prevent double prefixes if the DB already returned /fr/packages
    if (SUPPORTED_LANGUAGES.some(l => cleanUrl.startsWith(`/${l.code}/`) || cleanUrl === `/${l.code}`)) {
      return cleanUrl; 
    }
    
    if (cleanUrl === '/') return `/${currentLang}`;
    
    return `/${currentLang}${cleanUrl}`;
  };

  return { getLocalizedUrl, currentLang };
}
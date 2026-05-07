"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../lib/languages";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract the current language from the URL (e.g., "/fr/packages" -> "fr")
  const currentLangCode = pathname.split('/')[1];
  const activeLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLangCode) 
                     || SUPPORTED_LANGUAGES.find(lang => lang.code === DEFAULT_LANGUAGE);

  // NEW: Hierarchical aggressive cookie handler
  const applyGoogleTranslate = (langCode: string) => {
    const host = window.location.hostname;
    const domainParts = host.split('.');

    // 1. NUKE EVERYTHING: Iterate through all domain levels and clear the cookie
    // This catches 'development-habari.habariadventure.com', '.habariadventure.com', etc.
    
    // First, clear without specifying a domain (catches strict local cookies)
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Next, crawl up the domain hierarchy and nuke everything
    for (let i = 0; i < domainParts.length; i++) {
      const currentDomain = domainParts.slice(i).join('.');
      
      // Try deleting it with the exact domain
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${currentDomain};`;
      // Try deleting it with the wildcard leading dot (which Google uses)
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${currentDomain};`;
    }

    // 2. APPLY NEW: If not English, set the new cookie 
    if (langCode !== 'en') {
      // Just set it strictly on the current host to prevent future cross-subdomain bleeding
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
    }
  };

  // Sync Google Translate when the URL changes (e.g., on initial load or back button)
  useEffect(() => {
    const code = activeLang?.code || 'en';
    applyGoogleTranslate(code);
  }, [activeLang]);

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false);

    // 1. Wipe old cookies and set the new ones immediately
    applyGoogleTranslate(langCode);

    // 2. Strip the language prefix to get bare path segments
    const pathSegments = pathname.split('/').filter(Boolean);
    if (SUPPORTED_LANGUAGES.some(l => l.code === pathSegments[0])) {
      pathSegments.shift();
    }

    // 3. Blog detail pages use localized slugs (e.g. /fr/blogs/french-slug).
    //    A localized slug doesn't resolve in other languages — the canonical English
    //    slug must be used instead. The blog detail page then normalizes the URL to
    //    the target language's slug via window.history.replaceState after loading.
    //
    //    Pattern: ["blogs", "<slug>"] — exactly 2 segments starting with "blogs".
    const isBlogDetail = pathSegments[0] === 'blogs' && pathSegments.length === 2;
    if (isBlogDetail) {
      const entity = (window as any).__localeEntity as { canonicalSlug?: string } | undefined;
      if (entity?.canonicalSlug) {
        const newPath = langCode === DEFAULT_LANGUAGE
          ? `/blogs/${entity.canonicalSlug}`
          : `/${langCode}/blogs/${entity.canonicalSlug}`;
        window.location.href = newPath;
        return;
      }
    }

    // 4. Location pages: exactly 2 segments, not starting with 'blogs'
    //    Pattern: [category, locationSlug] e.g. ["destinations", "gorilla-hike"]
    //    The location page sets __localeEntity.canonicalSlug to the full English path
    //    so the target page can always resolve via the English canonical slug.
    const isLocationPage = pathSegments.length === 2 && pathSegments[0] !== 'blogs';
    if (isLocationPage) {
      const entity = (window as any).__localeEntity as { canonicalSlug?: string } | undefined;
      if (entity?.canonicalSlug) {
        const newPath = langCode === DEFAULT_LANGUAGE
          ? `/${entity.canonicalSlug}`
          : `/${langCode}/${entity.canonicalSlug}`;
        window.location.href = newPath;
        return;
      }
    }

    // 5. Package detail pages: 3+ segments not starting with 'blogs'
    //    Pattern: [category, location, ...packageSlug]
    //    Use canonical English slug so the target page can resolve via API.
    const isPackageDetail = pathSegments.length >= 3 && pathSegments[0] !== 'blogs';
    if (isPackageDetail) {
      const entity = (window as any).__localeEntity as { canonicalSlug?: string } | undefined;
      if (entity?.canonicalSlug) {
        const newPath = langCode === DEFAULT_LANGUAGE
          ? `/${entity.canonicalSlug}`
          : `/${langCode}/${entity.canonicalSlug}`;
        window.location.href = newPath;
        return;
      }
    }

    // 6. Default: swap language prefix, keep the rest of the path unchanged.
    //    Correct for category pages (/[lang]/[category]) and any other static segments.
    const newPath = langCode === DEFAULT_LANGUAGE
      ? `/${pathSegments.join('/')}`
      : `/${langCode}/${pathSegments.join('/')}`;
    window.location.href = newPath || '/';
  };

  return (
    <div className="relative inline-block text-left">
      {/* DROPDOWN BUTTON */}
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#135D66]"
      >
        <span className="mr-2 text-lg">{activeLang?.flag}</span>
        {activeLang?.code.toUpperCase()}
        <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                  activeLang?.code === lang.code ? 'bg-[#E9F4F5] text-[#135D66] font-bold' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
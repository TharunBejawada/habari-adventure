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

  // NEW: Unified aggressive cookie handler
  const applyGoogleTranslate = (langCode: string) => {
    const domain = window.location.hostname;

    // 1. NUKE EVERYTHING: Aggressively clear existing googtrans cookies across ALL scopes
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;

    // 2. APPLY NEW: If not English, set the new cookie across ALL scopes so Google can't get confused
    if (langCode !== 'en') {
      const gtCookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = gtCookie;
      document.cookie = `${gtCookie} domain=${domain};`;
      document.cookie = `${gtCookie} domain=.${domain};`;
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

    // 2. Construct the new URL
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // If the first segment is an existing language code, remove it
    if (SUPPORTED_LANGUAGES.some(l => l.code === pathSegments[0])) {
      pathSegments.shift();
    }
    
    // Build the new path
    const newPath = langCode === DEFAULT_LANGUAGE 
      ? `/${pathSegments.join('/')}` 
      : `/${langCode}/${pathSegments.join('/')}`;

    // 3. Navigate and force a reload to trigger Google's script cleanly on the new route
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
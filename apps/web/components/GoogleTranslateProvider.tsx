// apps/web/components/GoogleTranslateProvider.tsx
"use client";

import { useEffect } from "react";

export default function GoogleTranslateProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { 
          pageLanguage: 'en', 
          autoDisplay: false 
        }, 
        'google_translate_element'
      );
    };

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete (window as any).googleTranslateElementInit;
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* 1. Hide the specific iframe classes Google injects */
        iframe.skiptranslate,
        iframe.VIpgJd-ZVi9od-ORHb-OEVmcd { 
          display: none !important; 
          visibility: hidden !important;
        }
        
        /* 2. Hide the wrapper div that Google drops right inside the body */
        body > div.skiptranslate { 
          display: none !important; 
          height: 0 !important;
        }
        
        /* 3. Force the body back to the top (Google tries to push it down 40px) */
        body { 
          top: 0px !important; 
          position: static !important; 
        }
        
        /* 4. Hide all the old legacy banner classes and tooltips */
        .goog-te-banner-frame { display: none !important; }
        .goog-te-menu-value { display: none !important; }
        #goog-gt-tt, .goog-tooltip { display: none !important; visibility: hidden !important; }
        .goog-tooltip:hover { display: none !important; }
        
        /* 5. Remove the ugly yellow hover highlight Google applies to translated text */
        .goog-text-highlight { 
          background-color: transparent !important; 
          border: none !important; 
          box-shadow: none !important; 
        }
        
        /* 6. Hide our injection container */
        #google_translate_element { display: none !important; }
      `}} />
      
      <div id="google_translate_element"></div>
      
      {children}
    </>
  );
}
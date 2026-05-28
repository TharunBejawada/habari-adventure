// apps/web/app/[lang]/[category]/[location]/[packageSlug]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../../../../lib/apiClient";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; 

import UpcomingDates from "../../../../../components/packages/UpcomingDates";
import PreparationGuide from "../../../../../components/packages/PreparationGuide";
import RelatedAdventures from "../../../../../components/packages/RelatedAdventures";
import Testimonials from "../../../../../components/packages/Testimonials";
import WhyChooseHabari from "../../../../../components/packages/WhyChooseHabari";
import NextJourneyCTA from "../../../../../components/packages/NextJourneyCTA";

// NEW: Import the Booking Modal
import BookingModal from "../../../../../components/modals/BookingModal";


export default function PackageLandingPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract the lang code from the URL folder structure
  const lang = (params.lang as string) || "en"; 

  const categoryParam = decodeURIComponent(params.category as string);
  const locationParam = decodeURIComponent(params.location as string);
  
  // FIX: Handle the Catch-All array, decode each piece, and stitch it back together with slashes
  const packageSlugArray = params.packageSlug as string[] || [];
  const packageParam = packageSlugArray.map(p => decodeURIComponent(p)).join('/');

  // Reconstruct the full database slug (e.g., "climbing/kilimanjaro/8-days-lemosho")
  const fullDbSlug = `${categoryParam}/${locationParam}/${packageParam}`;

  const [pkg, setPkg] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction State
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // NEW: Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalData, setBookingModalData] = useState<any>({});

  // NEW: Universal Booking Handler
  const openBooking = (groupSize: string = "", departureDate: string = "") => {
    setBookingModalData({
      bookingType: departureDate ? "UpcomingDate" : "Package",
      location: pkg?.location || locationParam,
      packageName: pkg?.title || "",
      groupSize: groupSize,
      departureDate: departureDate,
    });
    setIsBookingModalOpen(true);
  };

  // --- FETCH DATA ---
  useEffect(() => {
    // FIX 2: Use the correctly extracted packageParam instead of the old 'slug' variable
    if (!packageParam) return;
    
    const load = async () => {
      const [pkgResult, pricingResult] = await Promise.all([
        apiFetch(`/packages/${encodeURIComponent(fullDbSlug)}?lang=${lang}`),
        apiFetch("/pricing"),
      ]);
      if (pkgResult.ok && pkgResult.data?.isPublished) {
        setPkg(pkgResult.data);
        if (Array.isArray(pricingResult.data)) {
          const matchedPricing = pricingResult.data.find((p: any) => p.packageId === pkgResult.data.id);
          setPricing(matchedPricing || null);
        }
        // Expose canonical slug for LanguageSwitcher cross-language navigation.
        // pkg.canonicalSlug may be just the terminal segment (e.g. "3-days-trek") if the DB
        // stores only the package-specific slug without the category/location prefix.
        // categoryParam and locationParam are always English canonical slugs in the URL
        // (location pages always link with canonical slugs), so we rebuild the full path here.
        if (typeof window !== 'undefined') {
          const rawCanonical = pkgResult.data.canonicalSlug || packageParam;
          const fullCanonicalSlug = rawCanonical.includes('/')
            ? rawCanonical
            : `${categoryParam}/${locationParam}/${rawCanonical}`;
          (window as any).__localeEntity = { canonicalSlug: fullCanonicalSlug };

          // Normalize URL: if the localized slug differs from what's currently in the URL,
          // update the address bar silently so the user sees the localized URL.
          const rawLocalized = pkgResult.data.slug || packageParam;
          const fullLocalizedSlug = rawLocalized.includes('/')
            ? rawLocalized
            : `${categoryParam}/${locationParam}/${rawLocalized}`;
          if (fullLocalizedSlug !== fullDbSlug) {
            window.history.replaceState({}, '', `/${lang}/${fullLocalizedSlug}`);
          }
        }
      } else {
        setPkg("NOT_FOUND");
      }
      setIsLoading(false);
    };
    load().catch(() => { setPkg("NOT_FOUND"); setIsLoading(false); });
  }, [fullDbSlug, packageParam, lang]);

  // Clear __localeEntity when navigating away
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__localeEntity = null;
      }
    };
  }, []);

  // --- SCROLL ANIMATION OBSERVER ---
  useEffect(() => {
    if (isLoading || !pkg || pkg === "NOT_FOUND") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, pkg, activeVariantIdx, pricing]); 

  // --- HORIZONTAL SCROLL FOR TABS ---
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#fe6e00] rounded-full animate-spin mb-6"></div>
        <p className="headingCSS text-[#fe6e00] font-bold text-xl animate-pulse">Preparing your adventure...</p>
      </div>
    );
  }

  if (pkg === "NOT_FOUND" || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] pt-32 pb-40 text-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="headingCSS text-4xl font-extrabold text-[#135D66] mb-4">Adventure Not Found</h1>
        <p className="descCSS text-gray-600 text-lg mb-8 max-w-md">We couldn't find this package. It may have been moved, deleted, or is currently saved as a draft.</p>
        <Link href={`/${lang}`} className="bg-[#fe6e00] hover:bg-[#c98616] text-white font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1">
          Explore Other Destinations
        </Link>
      </div>
    );
  }

  const activeVariant = pkg.itineraries?.[activeVariantIdx] || null;
  const hasCompareTable = pkg.whyChoose?.table && pkg.whyChoose.table.length > 0 && pkg.whyChoose.table[0].feature !== "";

  const stripHtml = (html: string) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .rte-content { word-break: break-word; overflow-wrap: break-word; max-width: 100%; }
        .rte-content p, .rte-content span { white-space: normal !important; max-width: 100%; }
        .rte-content p { margin-bottom: 1rem; line-height: 1.7; }
        .rte-content strong { color: inherit; }
        .rte-content span { background-color: transparent !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-center -mt-[150px] pt-[120px] pb-16 overflow-hidden bg-[#0a0f16]">
        {pkg.bannerImage ? (
          <div className="absolute inset-0 z-0">
            <Image src={pkg.bannerImage} alt={pkg.title} fill sizes="100vw" unoptimized className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-16">
          <div className="max-w-2xl reveal-on-scroll is-visible overflow-hidden">
            
            <h1 className="font-caveat notranslate text-white text-5xl sm:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-lg break-words">
              {pkg.title}
            </h1>
            
            {pkg.badgeText && (
              <h3 className="headingCSS text-2xl sm:text-3xl font-bold mb-6 drop-shadow-md text-white break-words">
                {/* <span className="text-[#fe6e00]">Kilimanjaro's</span>  */}
                {/* <span className="notranslate">{pkg.badgeText.replace("Kilimanjaro's ", "").replace("Kilimnjaro's ", "")}</span> */}
                <span className="notranslate text-[#fe6e00]">{pkg.badgeText}</span>
              </h3>
            )}

            <div 
              className="descCSS notranslate text-gray-200 text-lg font-medium mb-10 leading-relaxed drop-shadow-md rte-content max-w-full"
              dangerouslySetInnerHTML={{ __html: pkg.description?.replace(/&nbsp;/g, ' ') || "" }} 
            />

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => { document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="cursor-pointer bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1"
              >
                See Dates & Prices
              </button>
              
              {pkg.tripPlanPdf && (
                <a href={pkg.tripPlanPdf} target="_blank" rel="noreferrer" className="cursor-pointer bg-white text-gray-900 hover:bg-gray-100 font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1">
                  Download Trip Plan
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. QUICK FACTS                             */}
      {/* ========================================== */}
      {pkg.quickFacts && (
        <section className="py-12 lg:py-20 bg-[#F9FAFB] border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            
            <div className="w-full lg:w-3/5 reveal-on-scroll">
              <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-4">
                {pkg.quickFacts.heading}
              </h2>
              <div 
                className="descCSS notranslate text-gray-600 text-lg mb-10 rte-content" 
                dangerouslySetInnerHTML={{ __html: pkg.quickFacts.description?.replace(/&nbsp;/g, ' ') || "" }} 
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                {pkg.quickFacts.items?.map((fact: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-4 reveal-on-scroll delay-${(idx % 4) * 100}`}>
                    {fact.icon && (
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                        <img src={fact.icon} alt={fact.title} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h4 className="headingCSS font-bold text-[#fe6e00] text-lg mb-1">{fact.title}</h4>
                      <p className="descCSS notranslate text-gray-800 font-medium text-sm sm:text-base leading-snug">{fact.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* {pkg.quickFacts.image && (
              <div className="w-full lg:w-2/5 flex justify-center lg:justify-end reveal-on-scroll delay-200">
                <div className="relative w-full max-w-[400px] h-[450px]">
                  <Image src={pkg.quickFacts.image} alt="Quick Facts Illustration" fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-contain" />
                </div>
              </div>
            )} */}
            {pkg.quickFacts.image && (
              <div className="w-full lg:w-2/5 flex justify-start self-stretch reveal-on-scroll delay-200">
                <div className="relative w-full h-full min-h-[350px] lg:min-h-full">
                  <Image src={pkg.quickFacts.image} alt="Quick Facts Illustration" fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-contain object-left-top rounded-2xl" />
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 3. WHY CHOOSE THIS ROUTE                   */}
      {/* ========================================== */}
      {pkg.whyChoose && (
        <section className="py-12 lg:py-20 bg-white border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 reveal-on-scroll">
              <div>
                <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-4">
                  {pkg.whyChoose.heading}
                </h2>
                <div className="descCSS notranslate text-gray-600 text-lg rte-content max-w-2xl" dangerouslySetInnerHTML={{ __html: pkg.whyChoose.description?.replace(/&nbsp;/g, ' ') || "" }} />
              </div>
            </div>
            
            {hasCompareTable && (
                <button onClick={() => setIsCompareModalOpen(true)} className="cursor-pointer bg-[#111827] hover:bg-black mb-8 text-white font-bold py-3.5 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 shadow-md">
                  Compare with other routes
                </button>
              )}

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-10">
                {pkg.whyChoose.items?.map((item: any, idx: number) => (
                  <div key={idx} className={`reveal-on-scroll delay-${(idx % 3) * 100}`}>
                    <h4 className="headingCSS text-xl font-bold text-[#fe6e00] mb-2">{item.title}</h4>
                    <p className="descCSS notranslate text-gray-700 leading-relaxed text-lg">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* {pkg.whyChoose.image && (
                <div className="w-full lg:w-1/2 reveal-on-scroll delay-200">
                  <div className="relative w-full h-[250px] md:h-[350px] rounded-3xl overflow-hidden">
                    <Image src={pkg.whyChoose.image} alt="Elevation Profile" fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="object-contain p-4 md:p-8" />
                  </div>
                </div>
              )} */}
              {pkg.whyChoose.image && (
              <div className="w-full lg:w-1/2 flex justify-start self-stretch reveal-on-scroll delay-200">
                <div className="relative w-full h-full min-h-[350px] rounded-3xl overflow-hidden">
                  <Image 
                    src={pkg.whyChoose.image} 
                    alt="Elevation Profile" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw" 
                    unoptimized 
                    className="object-contain object-left-top" 
                  />
                </div>
              </div>
            )}
            </div>

          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 4. ITINERARY BUILDER                       */}
      {/* ========================================== */}
      {pkg.itineraries && pkg.itineraries.length > 0 && (
        <section className="py-16 lg:py-24 bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal-on-scroll">
              <div>
                <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-4">
                  {pkg.itineraryMeta?.heading || "Itinerary"}
                </h2>
                <div className="descCSS notranslate text-gray-600 text-lg rte-content max-w-3xl" dangerouslySetInnerHTML={{ __html: pkg.itineraryMeta?.description?.replace(/&nbsp;/g, ' ') || "" }} />
              </div>

              {activeVariant?.documentPdf && (
                <a href={activeVariant.documentPdf} target="_blank" rel="noreferrer" className="bg-[#111827] hover:bg-black text-white font-bold py-3.5 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2 shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Itinerary
                </a>
              )}
            </div>

            {/* SCROLLABLE VARIANT TABS */}
            {pkg.itineraries.length > 1 && (
              <div className="relative flex items-center mb-12 reveal-on-scroll group">
                
                {pkg.itineraries.length > 3 && (
                  <button onClick={() => scrollTabs('left')} className="absolute left-0 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-gray-100 rounded-full -ml-4 text-gray-600 hover:text-[#fe6e00] transition-colors focus:outline-none hidden md:flex">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}

                <div ref={tabsScrollRef} className="flex flex-nowrap gap-4 overflow-x-auto hide-scrollbar w-full py-2 px-2 scroll-smooth">
                  {pkg.itineraries.map((tab: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveVariantIdx(idx)}
                      className={`notranslate px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 ${
                        activeVariantIdx === idx 
                          ? "bg-[#fe6e00] text-white shadow-lg" 
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                      }`}
                    >
                      {tab.tabName}
                    </button>
                  ))}
                </div>

                {pkg.itineraries.length > 3 && (
                  <button onClick={() => scrollTabs('right')} className="absolute right-0 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-gray-100 rounded-full -mr-4 text-gray-600 hover:text-[#fe6e00] transition-colors focus:outline-none hidden md:flex">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            )}

            {/* Centered Image */}
            {activeVariant?.image && (
              <div className="w-full max-w-7xl mx-auto mb-16 relative h-auto rounded-2xl overflow-hidden shadow-md reveal-on-scroll">
                <Image 
                  src={activeVariant.image} 
                  alt={activeVariant.tabName || "Itinerary image"} 
                  width={1200}
                  height={800}
                  unoptimized
                  className="w-full h-auto object-cover rounded-2xl" 
                />
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              
              {/* Left Col: Timeline */}
              <div className="w-full lg:w-3/5 relative">
                <div className="space-y-10">
                  {activeVariant?.days.map((day: any, idx: number) => (
                    <div key={idx} className={`relative pl-8 md:pl-12 reveal-on-scroll delay-${(idx % 5) * 100}`}>
                      <div className="absolute left-[7px] top-3 bottom-[-40px] w-[2px] bg-gray-200 last:hidden"></div>
                      <div className="absolute left-0 top-1.5 w-[16px] h-[16px] bg-[#F9FAFB] border-4 border-[#fe6e00] rounded-full z-10"></div>

                      <div>
                        <div className="flex flex-wrap items-baseline gap-3 mb-2">
                          <span className="notranslate text-[#fe6e00] font-bold text-sm uppercase tracking-widest">{day.dayNumber}</span>
                          <h4 className="notranslate text-gray-900 font-bold text-lg md:text-xl uppercase tracking-wide">{day.heading}</h4>
                        </div>
                        
                        <div className="notranslate text-gray-600 rte-content max-w-none mb-4" dangerouslySetInnerHTML={{ __html: day.description?.replace(/&nbsp;/g, ' ') || "" }} />
                        
                        {day.timeTaken && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="notranslate">{day.timeTaken}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Included / Excluded Sticky Sidebar */}
              <div className="w-full lg:w-2/5">
                <div className="sticky top-32 space-y-10 reveal-on-scroll delay-200">
                  
                  {pkg.itineraryMeta?.included?.length > 0 && pkg.itineraryMeta.included[0] !== "" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h3>
                      <ul className="space-y-4">
                        {pkg.itineraryMeta.included.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed font-medium">
                            <div className="mt-1 w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="notranslate flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pkg.itineraryMeta?.notIncluded?.length > 0 && pkg.itineraryMeta.notIncluded[0] !== "" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Not Included</h3>
                      <ul className="space-y-4">
                        {pkg.itineraryMeta.notIncluded.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-500 leading-relaxed font-medium">
                            <div className="mt-1 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="notranslate flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 5. PRICING SECTION                         */}
      {/* ========================================== */}
      {pricing && (
        <section id="pricing-section" className="py-16 lg:py-24 bg-white border-b border-gray-100 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            
            <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
              <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-4">
                Pricing & <span className="text-[#fe6e00]">Group Sizes</span>
              </h2>
              <p className="descCSS text-gray-600 text-lg">
                Our per-person pricing decreases as your group size increases. Travel with friends or join a scheduled climb to save!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              
              <div 
                onClick={() => openBooking("1 Person")}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal-on-scroll cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Solo Traveler</h4>
                <p className="text-sm text-gray-400 font-medium mb-6">1 Person</p>
                <p className="notranslate text-4xl font-black text-gray-900 mb-2">${pricing.tier1}</p>
                <p className="text-sm font-bold text-gray-400">Per Person</p>
              </div>

              <div 
                onClick={() => openBooking("2 to 4 People")}
                className="bg-white border-2 border-[#135D66] rounded-3xl p-8 text-center shadow-lg relative hover:-translate-y-1 transition-all duration-300 reveal-on-scroll delay-100 cursor-pointer"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#135D66] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                  Most Popular
                </div>
                <div className="w-16 h-16 mx-auto bg-[#F0F9FA] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-[#135D66] uppercase tracking-widest mb-2">Small Group</h4>
                <p className="text-sm text-gray-500 font-medium mb-6">2 to 4 People</p>
                <p className="notranslate text-4xl font-black text-gray-900 mb-2">${pricing.tier2}</p>
                <p className="text-sm font-bold text-gray-400">Per Person</p>
              </div>

              <div 
                onClick={() => openBooking("5 to 9 People")}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal-on-scroll delay-200 cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Medium Group</h4>
                <p className="text-sm text-gray-400 font-medium mb-6">5 to 9 People</p>
                <p className="notranslate text-4xl font-black text-gray-900 mb-2">${pricing.tier3}</p>
                <p className="text-sm font-bold text-gray-400">Per Person</p>
              </div>

              <div 
                onClick={() => openBooking("10+ People")}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal-on-scroll delay-300 cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Large Group</h4>
                <p className="text-sm text-gray-400 font-medium mb-6">10+ People</p>
                <p className="notranslate text-4xl font-black text-gray-900 mb-2">${pricing.tier4}</p>
                <p className="text-sm font-bold text-gray-400">Per Person</p>
              </div>

            </div>

            <div className="flex flex-col items-center justify-center reveal-on-scroll delay-300">
              <button 
                onClick={() => openBooking("")}
                className="cursor-pointer bg-[#fe6e00] hover:bg-[#fe6e00] text-white font-black text-lg py-4 px-12 rounded-full uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-xl shadow-[#fe6e00]/30"
              >
                Book This Trip Now
              </button>
              <p className="text-gray-500 text-sm font-medium mt-4">Want to customize this trip? <Link href={`/${lang}/contact`} className="text-[#135D66] hover:text-[#fe6e00] hover:underline font-bold transition-colors">Contact us for a bespoke quote.</Link></p>
            </div>

          </div>
        </section>
      )}

      {/* External Components */}
      {/* NEW: Passed the onBook prop so UpcomingDates can trigger the modal */}
      <UpcomingDates onBook={(date: string) => openBooking("", date)} />
      <PreparationGuide />
      {/* <RelatedAdventures currentCategory={pkg.category} /> */}
      <RelatedAdventures currentCategory={pkg.category} currentPackageTitle={pkg.title} />
      <Testimonials />
      <WhyChooseHabari />
      <NextJourneyCTA />

      {/* ========================================== */}
      {/* COMPARISON MODAL                           */}
      {/* ========================================== */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-101 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCompareModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900">Route Comparison</h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="pb-4 font-bold text-gray-900 w-1/3">Feature</th>
                    <th className="notranslate pb-4 font-extrabold text-[#fe6e00] w-1/3 text-lg">{pkg.title}</th>
                    <th className="pb-4 font-bold text-gray-500 w-1/3 text-lg">Other Routes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pkg.whyChoose.table.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="notranslate py-5 pr-4 font-bold text-gray-800">{row.feature}</td>
                      <td className="notranslate py-5 pr-4 font-medium text-gray-900">{row.thisRoute}</td>
                      <td className="notranslate py-5 pr-4 text-gray-500">{row.otherRoutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setIsCompareModalOpen(false)} className="bg-[#111827] hover:bg-black text-white font-bold py-3 px-8 rounded-full transition-colors">Close Comparison</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* BOOKING MODAL                              */}
      {/* ========================================== */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        initialData={bookingModalData} 
      />

    </div>
  );
}
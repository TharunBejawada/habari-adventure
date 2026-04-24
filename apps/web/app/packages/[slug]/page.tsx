// apps/web/app/packages/[slug]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import UpcomingDates from "../../../components/packages/UpcomingDates";
import PreparationGuide from "../../../components/packages/PreparationGuide";
import RelatedAdventures from "../../../components/packages/RelatedAdventures";
import Testimonials from "../../../components/packages/Testimonials";
import WhyChooseHabari from "../../../components/packages/WhyChooseHabari";
import NextJourneyCTA from "../../../components/packages/NextJourneyCTA";

export default function PackageLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [pkg, setPkg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction State
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!slug) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && data.data.isPublished) {
          setPkg(data.data);
        } else {
          router.push("/packages");
        }
      })
      .catch(err => console.error("Failed to fetch package", err))
      .finally(() => setIsLoading(false));
  }, [slug, router]);

  // --- SCROLL ANIMATION OBSERVER ---
  useEffect(() => {
    if (isLoading || !pkg) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, pkg, activeVariantIdx]);

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
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#F51A43] rounded-full animate-spin mb-6"></div>
        <p className="text-[#F51A43] font-bold text-xl animate-pulse">Preparing your adventure...</p>
      </div>
    );
  }

  if (!pkg) return null;

  const activeVariant = pkg.itineraries?.[activeVariantIdx] || null;
  const hasCompareTable = pkg.whyChoose?.table && pkg.whyChoose.table.length > 0 && pkg.whyChoose.table[0].feature !== "";

  // Helper to safely strip HTML tags for the meta description fallback
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* 5. INJECTED SEO TAGS */}
      <title>{pkg.metaTitle || `${pkg.title} | Habari Adventure`}</title>
      <meta name="description" content={pkg.metaDescription || stripHtml(pkg.description).substring(0, 160)} />
      {pkg.metaKeywords && <meta name="keywords" content={pkg.metaKeywords} />}
      
      {/* --- INJECTED CSS FOR SCROLL REVEALS & RICH TEXT --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        
        /* 1. FORCE HERO TEXT WRAPPING TO PREVENT OVERFLOW */
        .rte-content { word-break: break-word; overflow-wrap: break-word; max-width: 100%; }
        .rte-content p, .rte-content span { white-space: normal !important; max-width: 100%; }
        .rte-content p { margin-bottom: 1rem; line-height: 1.7; }
        .rte-content strong { color: inherit; }
        .rte-content span { background-color: transparent !important; }

        /* 4. HIDE SCROLLBAR FOR VARIANT TABS */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full min-h-[70vh] flex flex-col justify-center -mt-[120px] pt-[120px] pb-16 overflow-hidden bg-[#0a0f16]">
        {pkg.bannerImage ? (
          <div className="absolute inset-0 z-0">
  <Image 
    src={pkg.bannerImage} 
    alt={pkg.title} 
    fill 
    unoptimized 
    className="object-fill" 
    priority 
  />
  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
  {/* <div className="absolute inset-0 bg-black/20" /> */}
  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
</div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-gray-800" />
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-16">
          <div className="max-w-2xl reveal-on-scroll is-visible overflow-hidden">
            
            <h1 className="text-white text-5xl sm:text-6xl font-extrabold uppercase tracking-tight mb-2 drop-shadow-lg break-words">
              {pkg.title}
            </h1>
            
            {pkg.badgeText && (
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 drop-shadow-md text-white break-words">
                <span className="text-[#F51A43]">Kilimanjaro's</span> {pkg.badgeText.replace("Kilimanjaro's ", "").replace("Kilimnjaro's ", "")}
              </h3>
            )}

            {/* Added max-w-full and strict wrapping class here */}
            <div 
              className="text-gray-200 text-lg font-medium mb-10 leading-relaxed drop-shadow-md rte-content max-w-full"
              dangerouslySetInnerHTML={{ __html: pkg.description }} 
            />

            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-[#F51A43] hover:bg-[#d41538] text-white font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1">
                See Dates & Prices
              </button>
              
              {pkg.tripPlanPdf && (
                <a href={pkg.tripPlanPdf} target="_blank" rel="noreferrer" className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm transition-all shadow-lg hover:-translate-y-1">
                  Download Trip Plan
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. QUICK FACTS (Reduced Padding)           */}
      {/* ========================================== */}
      {pkg.quickFacts && (
        <section className="py-12 lg:py-20 bg-white border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            
            <div className="w-full lg:w-3/5 reveal-on-scroll">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Quick <span className="text-[#F51A43]">Facts</span>
              </h2>
              <div 
                className="text-gray-600 text-lg mb-10 rte-content" 
                dangerouslySetInnerHTML={{ __html: pkg.quickFacts.description }} 
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
                      <h4 className="font-bold text-[#F51A43] text-lg mb-1">{fact.title}</h4>
                      <p className="text-gray-800 font-medium text-sm sm:text-base leading-snug">{fact.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pkg.quickFacts.image && (
              <div className="w-full lg:w-2/5 flex justify-center lg:justify-end reveal-on-scroll delay-200">
                <div className="relative w-full max-w-[400px] h-[450px]">
                  <Image src={pkg.quickFacts.image} alt="Quick Facts Illustration" fill unoptimized className="object-contain" />
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 3. WHY CHOOSE THIS ROUTE (Reduced Padding) */}
      {/* ========================================== */}
      {pkg.whyChoose && (
        <section className="py-12 lg:py-20 bg-white border-b border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal-on-scroll">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                  Why Choose <span className="text-[#F51A43]">{pkg.title.split(" ")[0]}</span>
                </h2>
                <div className="text-gray-600 text-lg rte-content max-w-2xl" dangerouslySetInnerHTML={{ __html: pkg.whyChoose.description }} />
              </div>
              
              {hasCompareTable && (
                <button onClick={() => setIsCompareModalOpen(true)} className="bg-[#111827] hover:bg-black text-white font-bold py-3.5 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 shadow-md">
                  Compare with other routes
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-10">
                {pkg.whyChoose.items?.map((item: any, idx: number) => (
                  <div key={idx} className={`reveal-on-scroll delay-${(idx % 3) * 100}`}>
                    <h4 className="text-xl font-bold text-[#F51A43] mb-2">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed text-lg">{item.desc}</p>
                  </div>
                ))}
              </div>

              {pkg.whyChoose.image && (
                <div className="w-full lg:w-1/2 reveal-on-scroll delay-200">
                  <div className="relative w-full h-[250px] md:h-[350px] rounded-3xl overflow-hidden">
                    <Image src={pkg.whyChoose.image} alt="Elevation Profile" fill unoptimized className="object-contain p-4 md:p-8" />
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
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                  {pkg.itineraryMeta?.heading || "Itinerary"}
                </h2>
                <div className="text-gray-600 text-lg rte-content max-w-3xl" dangerouslySetInnerHTML={{ __html: pkg.itineraryMeta?.description || "" }} />
              </div>

              {activeVariant?.documentPdf && (
                <a href={activeVariant.documentPdf} target="_blank" rel="noreferrer" className="bg-[#111827] hover:bg-black text-white font-bold py-3.5 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2 shadow-md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Itinerary
                </a>
              )}
            </div>

            {/* 4. SCROLLABLE VARIANT TABS */}
            {pkg.itineraries.length > 1 && (
              <div className="relative flex items-center mb-12 reveal-on-scroll group">
                
                {/* Left Arrow (Shows if > 3 tabs) */}
                {pkg.itineraries.length > 3 && (
                  <button onClick={() => scrollTabs('left')} className="absolute left-0 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-gray-100 rounded-full -ml-4 text-gray-600 hover:text-[#F51A43] transition-colors focus:outline-none hidden md:flex">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}

                {/* Tabs Container */}
                <div ref={tabsScrollRef} className="flex flex-nowrap gap-4 overflow-x-auto hide-scrollbar w-full py-2 px-2 scroll-smooth">
                  {pkg.itineraries.map((tab: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveVariantIdx(idx)}
                      className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 ${
                        activeVariantIdx === idx 
                          ? "bg-[#F51A43] text-white shadow-lg" 
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                      }`}
                    >
                      {tab.tabName}
                    </button>
                  ))}
                </div>

                {/* Right Arrow (Shows if > 3 tabs) */}
                {pkg.itineraries.length > 3 && (
                  <button onClick={() => scrollTabs('right')} className="absolute right-0 z-10 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-gray-100 rounded-full -mr-4 text-gray-600 hover:text-[#F51A43] transition-colors focus:outline-none hidden md:flex">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
            )}

            {/* NEW: Centered Image spanning the gap between tabs and the timeline */}
      {activeVariant?.image && (
        <div className="w-full max-w-5xl mx-auto mb-16 relative h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-md reveal-on-scroll">
          <Image 
            src={activeVariant.image} 
            alt={activeVariant.tabName || "Itinerary image"} 
            fill 
            unoptimized 
            className="object-fill" 
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
                      <div className="absolute left-0 top-1.5 w-[16px] h-[16px] bg-[#F9FAFB] border-4 border-[#F51A43] rounded-full z-10"></div>

                      <div>
                        <div className="flex flex-wrap items-baseline gap-3 mb-2">
                          <span className="text-[#F51A43] font-bold text-sm uppercase tracking-widest">{day.dayNumber}</span>
                          <h4 className="text-gray-900 font-bold text-lg md:text-xl uppercase tracking-wide">{day.heading}</h4>
                        </div>
                        
                        <div className="text-gray-600 rte-content max-w-none mb-4" dangerouslySetInnerHTML={{ __html: day.description }} />
                        
                        {day.timeTaken && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4 text-[#F51A43]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {day.timeTaken}
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
                  
                  {/* 3. INCLUDED FIX: Flex alignment & Green Checkmarks */}
                  {pkg.itineraryMeta?.included?.length > 0 && pkg.itineraryMeta.included[0] !== "" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h3>
                      <ul className="space-y-4">
                        {pkg.itineraryMeta.included.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700 leading-relaxed font-medium">
                            <div className="mt-1 w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. NOT INCLUDED FIX: Flex alignment & Red Crosses */}
                  {pkg.itineraryMeta?.notIncluded?.length > 0 && pkg.itineraryMeta.notIncluded[0] !== "" && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Not Included</h3>
                      <ul className="space-y-4">
                        {pkg.itineraryMeta.notIncluded.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-500 leading-relaxed font-medium">
                            <div className="mt-1 w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                            <span className="flex-1">{item}</span>
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

      <UpcomingDates />
      <PreparationGuide />
      <RelatedAdventures currentCategory={pkg.category} />
      <Testimonials />
      <WhyChooseHabari />
      <NextJourneyCTA />

      {/* ========================================== */}
      {/* COMPARISON MODAL                           */}
      {/* ========================================== */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    <th className="pb-4 font-extrabold text-[#F51A43] w-1/3 text-lg">{pkg.title}</th>
                    <th className="pb-4 font-bold text-gray-500 w-1/3 text-lg">Other Routes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pkg.whyChoose.table.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 pr-4 font-bold text-gray-800">{row.feature}</td>
                      <td className="py-5 pr-4 font-medium text-gray-900">{row.thisRoute}</td>
                      <td className="py-5 pr-4 text-gray-500">{row.otherRoutes}</td>
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

    </div>
  );
}
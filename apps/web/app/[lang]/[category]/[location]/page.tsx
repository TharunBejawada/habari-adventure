// apps/web/app/[lang]/[category]/[location]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../../../lib/apiClient";
import { normalizeSlugPath } from "../../../../lib/slugify";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

// ==========================================
// CENTRALIZED PACKAGE FILTERS CONFIGURATION
// ==========================================
const PACKAGE_FILTERS: Record<string, Record<string, string[]>> = {
  "Climbing": {
    "Duration": ["5 Days", "6 Days", "7 Days", "8 Days", "9+ Days"],
    "Route": ["Machame", "Lemosho", "Marangu", "Rongai", "Northern Circuit", "Umbwe"],
    "Difficulty": ["Moderate", "Challenging", "Advanced"],
    "Acclimatization": ["Standard", "Good", "Excellent", "Best"],
    "Scenery": ["Most Scenic", "Remote Wilderness", "Shira Plateau", "Glacier Views"],
    "Crowd Level": ["Quiet", "Balanced", "Popular"],
    "Travel Style": ["Private", "Group Departure", "Value", "Premium", "First-Time Friendly"]
  },
  "Safari": {
    "Duration": ["1 Day", "2 Days", "3 Days", "4 Days", "5+ Days"],
    "Destination": ["Serengeti", "Ngorongoro", "Tarangire", "Lake Manyara", "Maasai Mara"],
    "Experience": ["Classic Safari", "Big Five", "Migration", "Calving Season", "Honeymoon", "Short Safari"],
    "Season": ["Great Migration", "Calving Season", "Dry Season", "Green Season", "Year-Round"],
    "Style": ["Private", "Group", "Luxury", "Budget", "Family", "Honeymoon"],
    "Comfort": ["Budget", "Mid-Range", "Luxury", "Premium"]
  },
  "Destinations": {
    "Duration": ["4 Days", "5 Days", "7 Days"],
    "Experience": ["Beach Relaxation", "Stone Town & Culture", "Snorkeling", "Spice Tour", "Romantic Escape"],
    "Beach Style": ["Quiet Beach", "Lively Beach", "Romantic Beach", "Family-Friendly Beach"],
    "Travel Style": ["Private Trip", "Honeymoon", "Family Holiday", "Budget Friendly", "Luxury Escape"],
    "Comfort Level": ["Budget", "Mid-Range", "Luxury", "Premium"],
    "Traveler Type": ["Couples", "Families", "Solo Travelers", "Friends / Small Groups", "Honeymooners"]
  },
  "Day Trips": {
    "Activity Type": ["Safari", "Hiking", "Culture", "Waterfall", "Hot Springs", "Nature"],
    "Experience": ["Wildlife", "Adventure", "Relaxation", "Culture", "Scenic Nature", "Family Friendly"],
    "Fitness Level": ["Easy", "Moderate", "Active"],
    "Location": ["Moshi Area", "Arusha Area", "Kilimanjaro Area", "Materuni", "Chemka"],
    "Traveler Type": ["Families", "Couples", "Solo Travelers", "Friends / Small Groups", "First-Time Visitors"]
  }
};

// Helper to extract YouTube ID for iframe embed
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?rel=0` : null;
};

export default function LocationLandingPage() {
  const params = useParams();
  
  const lang = (params.lang as string) || "en";
  const categoryParam = params.category as string;
  const locationParam = params.location as string;
  const fullDbSlug = categoryParam ? `${categoryParam}/${locationParam}` : locationParam;

  const [packages, setPackages] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);

  // Search, Pagination & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__localeEntity = null;
      }
    };
  }, []);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    setIsLoading(true);
    const encodedSlug = fullDbSlug.split("/").map(encodeURIComponent).join("/");
    const load = async () => {
      const locResult = await apiFetch(`/locations/${encodedSlug}?lang=${lang}`);
      if (locResult.ok && locResult.data) {
        setLocationData(locResult.data);

        if (typeof window !== 'undefined') {
          const rawCanonical = locResult.data.canonicalSlug || locationParam;
          const fullCanonicalSlug = rawCanonical.includes('/')
            ? rawCanonical
            : `${categoryParam}/${rawCanonical}`;
          (window as any).__localeEntity = { canonicalSlug: fullCanonicalSlug };

          const rawLocalized = locResult.data.slug || locationParam;
          const fullLocalizedSlug = rawLocalized.includes('/')
            ? rawLocalized
            : `${categoryParam}/${rawLocalized}`;
          if (fullLocalizedSlug !== fullDbSlug) {
            window.history.replaceState({}, '', `/${lang}/${fullLocalizedSlug}`);
          }
        }

        const canonicalTitle = locResult.data.canonicalTitle || locResult.data.title;
        const packResult = await apiFetch(
          `/packages/location/${encodeURIComponent(canonicalTitle)}?locationSlug=${encodeURIComponent(fullDbSlug)}&lang=${lang}`
        );
        if (packResult.ok && Array.isArray(packResult.data)) {
          setPackages(packResult.data);
        }
      }
      setIsLoading(false);
    };
    load().catch(() => setIsLoading(false));
  }, [fullDbSlug, lang, categoryParam, locationParam]);

  // --- 2. EXTRACT DYNAMIC FILTERS & MERGE WITH STATIC DEFINITIONS ---
  const availableFilters = useMemo(() => {
    if (packages.length === 0) return [];

    const usedFiltersMap: Record<string, Set<string>> = {};
    let pkgCategory = "";

    packages.forEach(pkg => {
      if (!pkgCategory && pkg.category) pkgCategory = pkg.category;
      const pkgFilters = pkg.filters || {};
      
      Object.entries(pkgFilters).forEach(([key, val]) => {
        // CHANGED: Defensively handle the value as an array (since it might be a string from old data, or an array now)
        const valuesArray = Array.isArray(val) ? val : [val];
        
        valuesArray.forEach(v => {
          if (typeof v === 'string' && v.trim() !== '') {
            if (!usedFiltersMap[key]) usedFiltersMap[key] = new Set();
            usedFiltersMap[key].add(v);
          }
        });
      });
    });

    const predefinedTemplate = PACKAGE_FILTERS[pkgCategory] || {};
    const finalFilters: { category: string; options: string[] }[] = [];

    Object.entries(predefinedTemplate).forEach(([filterKey, predefinedOptions]) => {
      if (usedFiltersMap[filterKey]) {
        const validOptions = predefinedOptions.filter(opt => usedFiltersMap[filterKey]?.has(opt));
        if (validOptions.length > 0) {
          finalFilters.push({ category: filterKey, options: validOptions });
        }
        delete usedFiltersMap[filterKey];
      }
    });

    Object.entries(usedFiltersMap).forEach(([filterKey, usedOptionsSet]) => {
      if (usedOptionsSet.size > 0) {
        finalFilters.push({ category: filterKey, options: Array.from(usedOptionsSet) });
      }
    });

    return finalFilters;
  }, [packages]);

  // --- 3. APPLY SEARCH & FILTERS TO PACKAGES ---
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const searchMatch = searchQuery.trim() === "" || 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!searchMatch) return false;

      if (Object.keys(activeFilters).length === 0) return true;

      const pkgFilters = pkg.filters || {};

      return Object.entries(activeFilters).every(([filterCategory, selectedValues]) => {
        if (selectedValues.length === 0) return true; 
        
        // CHANGED: Ensure the package's filter values for this category are treated as an array
        const pkgFilterValues = Array.isArray(pkgFilters[filterCategory]) 
          ? pkgFilters[filterCategory] 
          : [pkgFilters[filterCategory]].filter(Boolean);

        // Check if ANY of the package's filter values match ANY of the selected values
        return pkgFilterValues.some((v: string) => selectedValues.includes(v));
      });
    });
  }, [packages, activeFilters, searchQuery]);

  // --- 4. PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const currentPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const currentCategoryFilters = prev[category] || [];
      const isSelected = currentCategoryFilters.includes(value);
      
      let newCategoryFilters;
      if (isSelected) {
        newCategoryFilters = currentCategoryFilters.filter(v => v !== value);
      } else {
        newCategoryFilters = [...currentCategoryFilters, value];
      }

      const newState = { ...prev, [category]: newCategoryFilters };
      if (newState[category]?.length === 0) delete newState[category];
      
      setCurrentPage(1); 
      return newState;
    });
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const isFilteringOrSearching = Object.keys(activeFilters).length > 0 || searchQuery.trim() !== "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#fe6e00] rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  const fallbackTitle = locationParam ? locationParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Destination";
  const displayTitle = locationData?.title || fallbackTitle;

  return (
    <div className="bg-[#FDFEFE] min-h-screen font-sans text-gray-800 pb-24">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden -mt-[150px] z-0">
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
            .animate-fade-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            .animate-fade-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            @keyframes moveCloudContact { 0% { transform: translateX(-20vw); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateX(110vw); opacity: 0; } }
            .animate-cloud-horizontal { animation: moveCloudContact 40s linear infinite; }
            @keyframes movePlaneDiag { 0% { transform: translate(-20vw, -5vh) rotate(15deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(110vw, 15vh) rotate(15deg); opacity: 0; } }
            .animate-plane-diagonal { animation: movePlaneDiag 25s linear infinite; }
            @keyframes floatUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
            @keyframes floatDown { 0%, 100% { transform: translateY(-30px); } 50% { transform: translateY(0); } }
            .animate-balloon-1 { animation: floatUp 6s ease-in-out infinite; }
            .animate-balloon-2 { animation: floatDown 7s ease-in-out infinite; }
          `
        }} />

        <div className="absolute inset-0 z-0">
          <Image src={locationData?.heroImage || "/contact-mountains.png"} alt="Mountains Background" fill sizes="100vw" unoptimized className="object-cover object-bottom opacity-90" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="absolute top-[25%] lg:top-[30%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-cloud-horizontal">
            <Image src="/Cloud3.png" alt="Cloud" width={320} height={183} sizes="(max-width: 768px) 180px, 320px" className="w-[180px] md:w-[320px] opacity-80" />
          </div>
        </div>

        <div className="absolute top-[10%] lg:top-[15%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-plane-diagonal">
            <Image src="/plane.png" alt="Airplane" width={300} height={150} sizes="(max-width: 768px) 180px, 300px" className="w-[180px] md:w-[300px] drop-shadow-xl" />
          </div>
        </div>

        <div className="absolute top-[10%] right-0 lg:right-5 z-10 pointer-events-none hidden md:block">
          <div className="relative w-[200px] h-[350px]">
            <div className="absolute top-0 right-14 animate-balloon-1">
              <Image src="/balloon-blue.png" alt="Hot Air Balloon" width={130} height={176} sizes="(max-width: 1024px) 100px, 130px" className="w-[100px] lg:w-[130px] drop-shadow-xl" />
            </div>
            <div className="absolute top-32 right-[-10px] animate-balloon-2">
              <Image src="/balloon-red.png" alt="Hot Air Balloon" width={90} height={130} sizes="(max-width: 1024px) 70px, 90px" className="w-[70px] lg:w-[90px] drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto w-[96%] relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="headingCSS animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-[0.85em]">Explore</span>{' '}<span className={`notranslate ${caveat.className} text-[#fe6e00] font-normal text-[1.1em]`}>{displayTitle}</span>
          </h1>
          <p className="descCSS animate-fade-left font-medium text-gray-200 text-sm md:text-base leading-relaxed max-w-3xl mb-12 drop-shadow-md" style={{ animationDelay: '0.3s' }}>
            Discover our curated selection of routes and adventures designed for the ultimate <span className="notranslate">{displayTitle}</span> experience.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 1.5 LOCATION OVERVIEW                      */}
      {/* ========================================== */}
      {locationData && (locationData.overviewText || locationData.bannerImage || locationData.youtubeVideoUrl) && (
        <section className="relative z-20 -mt-24 mb-16 px-4">
          <div className="w-[95%] md:w-[80%] max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
            
            {(locationData.bannerImage || locationData.youtubeVideoUrl) && (
              <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-[400px] bg-gray-100 shrink-0">
                {locationData.youtubeVideoUrl ? (
                  <iframe 
                    className="absolute inset-0 w-full h-full object-cover"
                    src={getYouTubeEmbedUrl(locationData.youtubeVideoUrl) || ""}
                    title={`${locationData.title || displayTitle} Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Image src={locationData.bannerImage} alt={locationData.title || displayTitle} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" unoptimized />
                )}
              </div>
            )}

            <div className={`min-w-0 w-full ${(locationData.bannerImage || locationData.youtubeVideoUrl) ? 'lg:w-1/2' : 'w-full'} p-8 md:p-12 flex flex-col justify-center`}>
              <h2 className="notranslate headingCSS text-3xl font-extrabold text-[#135D66] mb-4 truncate">
                {locationData.title || displayTitle}
              </h2>
              
              <div 
                className="descCSS notranslate text-gray-600 text-sm md:text-base leading-relaxed space-y-3 break-words [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full"
                dangerouslySetInnerHTML={{ 
                  __html: locationData.overviewText
                    .replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 1.5rem;">')
                    .replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 1.5rem;">') 
                }}
              />
            </div>

          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 2. MAIN CONTENT (FILTERS & GRID)           */}
      {/* ========================================== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-10">
          
          {/* --- LEFT SIDEBAR: DYNAMIC FILTERS (Only show if filters exist) --- */}
          {availableFilters.length > 0 && (
            <div className="w-full lg:w-1/4 shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-32">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <h3 className="font-extrabold text-xl text-[#135D66]">Filters</h3>
                  {Object.keys(activeFilters).length > 0 && (
                    <button 
                      onClick={() => { setActiveFilters({}); setCurrentPage(1); }}
                      className="text-xs font-bold text-[#fe6e00] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  {availableFilters.map((filterGroup) => (
                    <div key={filterGroup.category}>
                      <h4 className="font-bold text-gray-900 mb-3">{filterGroup.category}</h4>
                      <div className="space-y-2">
                        {filterGroup.options.map((optionValue, idx) => {
                          const isChecked = activeFilters[filterGroup.category]?.includes(optionValue) || false;
                          return (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#135D66] border-[#135D66]' : 'border-gray-300 group-hover:border-[#135D66]'}`}>
                                {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={isChecked} 
                                onChange={() => toggleFilter(filterGroup.category, optionValue)} 
                              />
                              
                              <span className={`text-sm ${isChecked ? 'font-bold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {optionValue}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- RIGHT GRID: SEARCH & PACKAGE CARDS --- */}
          <div className={`w-full ${availableFilters.length > 0 ? 'lg:w-3/4' : ''}`}>
            
            <div className="mb-10">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={`Search ${displayTitle} adventures...`}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#135D66] focus:border-transparent transition-all shadow-sm text-gray-700 font-medium"
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {isFilteringOrSearching && (
              <div className="mb-6 flex justify-between items-center animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900">Available Routes</h2>
                <span className="text-sm font-medium text-gray-500">{filteredPackages.length} Adventures Found</span>
              </div>
            )}

            {filteredPackages.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No routes found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term to see more options.</p>
                <button 
                  onClick={() => { setActiveFilters({}); setSearchQuery(""); }} 
                  className="mt-6 bg-[#135D66] hover:bg-[#0f4a52] text-white font-bold py-2.5 px-6 rounded-full transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${availableFilters.length === 0 ? 'lg:grid-cols-3' : ''} gap-8 mb-12`}>
                  {currentPackages.map((pkg) => (
                    <Link href={`/${lang}/${normalizeSlugPath(pkg.canonicalSlug || pkg.slug)}`} key={pkg.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      
                      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                        {pkg.bannerImage ? (
                          <Image src={pkg.bannerImage} alt={pkg.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-[#135D66]/10 flex items-center justify-center">
                            <span className="text-[#135D66] font-bold">Habari Adventure</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="notranslate bg-white/90 backdrop-blur-sm text-[#135D66] text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm">
                            {pkg.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="notranslate text-2xl font-extrabold text-gray-900 mb-2 transition-colors">{pkg.title}</h3>
                        
                        {pkg.badgeText && (
                          <p className="notranslate text-sm font-bold text-[#fe6e00] mb-3">{pkg.badgeText}</p>
                        )}
                        
                        <p className="notranslate text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 break-words">
                          {stripHtml(pkg.description?.replace(/&nbsp;/g, ' ') || "")}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#135D66] group-hover:text-[#fe6e00] transition-colors flex items-center gap-1">
                            Explore Route 
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </span>
                        </div>
                      </div>

                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                            currentPage === i + 1 
                              ? 'bg-[#135D66] text-white shadow-md' 
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
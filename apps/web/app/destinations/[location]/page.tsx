// apps/web/app/destinations/[location]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

// --- STATIC FILTER DEFINITION ---
const STATIC_FILTERS = [
  {
    category: "Duration",
    options: ["1-5 Days", "6-7 Days", "8+ Days"]
  },
  {
    category: "Distance",
    options: ["Under 50 km", "50 - 80 km", "Over 80 km"]
  },
  {
    category: "Max Altitude",
    options: ["Under 4,000m", "4,000m - 5,000m", "Over 5,000m"]
  },
  {
    category: "Best Seasons",
    options: ["Jan-Mar", "Apr-May", "Jun-Oct", "Nov-Dec"]
  },
  {
    category: "Difficulty",
    options: ["Easy", "Moderate", "Challenging", "Extreme"]
  }
];

export default function LocationLandingPage() {
  const params = useParams();
  
  // Fully decode the URL to handle %20 and other encoded characters
  const decodedUrl = decodeURIComponent(params.location as string);
  const locationSlug = decodedUrl.replace(/-/g, ' '); 

  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Pagination & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages/location/${encodeURIComponent(locationSlug)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") setPackages(data.data);
      })
      .catch(err => console.error("Failed to fetch packages", err))
      .finally(() => setIsLoading(false));
  }, [locationSlug]);

  // --- 2. SMART PARSING FOR RANGES ---
  const checkRangeFilter = (category: string, selectedValues: string[], factDesc: string) => {
    const text = factDesc.toLowerCase().replace(/,/g, '');
    const numbers = text.match(/\d+/g)?.map(Number) || [];
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;

    return selectedValues.some(val => {
      // Numerical Range Checks
      if (category === "Duration") {
        if (val === "1-5 Days") return maxNum >= 1 && maxNum <= 5;
        if (val === "6-7 Days") return maxNum >= 6 && maxNum <= 7;
        if (val === "8+ Days") return maxNum >= 8;
      }
      if (category === "Distance") {
        if (val === "Under 50 km") return maxNum > 0 && maxNum < 50;
        if (val === "50 - 80 km") return maxNum >= 50 && maxNum <= 80;
        if (val === "Over 80 km") return maxNum > 80;
      }
      if (category === "Max Altitude") {
        if (val === "Under 4,000m") return maxNum > 0 && maxNum < 4000;
        if (val === "4,000m - 5,000m") return maxNum >= 4000 && maxNum <= 5000;
        if (val === "Over 5,000m") return maxNum > 5000;
      }
      
      // String Inclusion Checks (For Difficulty, Seasons, etc.)
      return text.includes(val.toLowerCase());
    });
  };

  // --- 3. APPLY SEARCH & FILTERS TO PACKAGES ---
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      // A. Text Search Check
      const searchMatch = searchQuery.trim() === "" || 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!searchMatch) return false;

      // B. Static Filter Checks
      if (Object.keys(activeFilters).length === 0) return true;

      return Object.entries(activeFilters).every(([filterCategory, selectedValues]) => {
        if (selectedValues.length === 0) return true; 
        
        // Find this category in the package's quick facts
        const packageFact = pkg.quickFacts?.items?.find((f: any) => f.title === filterCategory);
        if (!packageFact) return false; 

        // Use our smart range checker
        return checkRangeFilter(filterCategory, selectedValues, packageFact.desc);
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
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#F51A43] rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  // Formatting Location Title for Hero
  const displayTitle = locationSlug.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="bg-[#FDFEFE] min-h-screen font-sans text-gray-800 pb-24">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden -mt-[120px] z-0">
        
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
          <Image src="/contact-mountains.png" alt="Mountains Background" fill className="object-cover object-bottom opacity-90" priority />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="absolute top-[25%] lg:top-[30%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-cloud-horizontal">
            <Image src="/Cloud3.png" alt="Cloud" width={350} height={200} className="w-[180px] md:w-[320px] opacity-80" />
          </div>
        </div>

        <div className="absolute top-[10%] lg:top-[15%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-plane-diagonal">
            <Image src="/plane.png" alt="Airplane" width={300} height={150} className="w-[180px] md:w-[300px] drop-shadow-xl" />
          </div>
        </div>

        <div className="absolute top-[10%] right-0 lg:right-5 z-10 pointer-events-none hidden md:block">
          <div className="relative w-[200px] h-[350px]">
            <div className="absolute top-0 right-14 animate-balloon-1">
              <Image src="/balloon-blue.png" alt="Hot Air Balloon" width={140} height={190} className="w-[100px] lg:w-[130px] drop-shadow-xl" />
            </div>
            <div className="absolute top-32 right-[-10px] animate-balloon-2">
              <Image src="/balloon-red.png" alt="Hot Air Balloon" width={90} height={130} className="w-[70px] lg:w-[90px] drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto w-[96%] relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#135D66] mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
            Explore <span className={`${caveat.className} text-[#E59A1D] font-normal`}>{displayTitle}</span>
          </h1>
          <p className="animate-fade-left font-medium text-gray-800 text-sm md:text-base leading-relaxed max-w-3xl mb-12 drop-shadow-md" style={{ animationDelay: '0.3s' }}>
            Discover our curated selection of routes and adventures designed for the ultimate {displayTitle} experience.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. MAIN CONTENT (FILTERS & GRID)           */}
      {/* ========================================== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-10">
          
          {/* --- LEFT SIDEBAR: STATIC FILTERS --- */}
          <div className="w-full lg:w-1/4 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-32">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="font-extrabold text-xl text-[#135D66]">Filters</h3>
                {Object.keys(activeFilters).length > 0 && (
                  <button 
                    onClick={() => { setActiveFilters({}); setCurrentPage(1); }}
                    className="text-xs font-bold text-[#F51A43] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {STATIC_FILTERS.map((filterGroup) => (
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

          {/* --- RIGHT GRID: SEARCH & PACKAGE CARDS --- */}
          <div className="w-full lg:w-3/4">
            
            {/* Search Bar */}
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

            {/* Conditional Header */}
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
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {currentPackages.map((pkg) => (
                    <Link href={`/packages/${pkg.slug}`} key={pkg.id} className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      
                      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                        {pkg.bannerImage ? (
                          <Image src={pkg.bannerImage} alt={pkg.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 bg-[#135D66]/10 flex items-center justify-center">
                            <span className="text-[#135D66] font-bold">Habari Adventure</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-[#135D66] text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm">
                            {pkg.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-[#F51A43] transition-colors">{pkg.title}</h3>
                        {pkg.badgeText && (
                          <p className="text-sm font-bold text-[#E59A1D] mb-3">{pkg.badgeText}</p>
                        )}
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 break-words">
  {stripHtml(pkg.description)}
</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#135D66] group-hover:text-[#F51A43] transition-colors flex items-center gap-1">
                            Explore Route 
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </span>
                        </div>
                      </div>

                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
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
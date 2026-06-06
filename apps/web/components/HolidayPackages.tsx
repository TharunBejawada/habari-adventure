// apps/web/components/HolidayPackages.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "../lib/apiClient";
import { useLocalizedUrl } from "../hooks/useLocalizedUrl";

export default function HolidayPackages() {
  const [activeFilter, setActiveFilter] = useState("All Packages");
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW: Carousel Pagination State ---
  const [currentPage, setCurrentPage] = useState(0);
  const { getLocalizedUrl } = useLocalizedUrl();
  
  // Reference for the scrolling carousel
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = ["All Packages", "Climbing", "Safari", "Destinations", "Day Trips"];

  // --- FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pkgResult, pricingResult] = await Promise.all([
          apiFetch("/packages"),
          apiFetch("/pricing"),
        ]);

        if (pkgResult.ok && Array.isArray(pkgResult.data)) {
          // Merge pricing data into the packages array
          // const mergedPackages = pkgResult.data.map((pkg: any) => {
          //   const matchedPricing = Array.isArray(pricingResult.data) 
          //     ? pricingResult.data.find((p: any) => p.packageId === pkg.id) 
          //     : null;
            
          //   return {
          //     ...pkg,
          //     startingPrice: matchedPricing?.tier4 || null,
          //   };
          // });
          const mergedPackages = pkgResult.data.map((pkg: any) => {
            const matchedPricing = Array.isArray(pricingResult.data) 
              ? pricingResult.data.find((p: any) => p.packageId === pkg.id) 
              : null;
            
            let startingPrice = null;

            if (matchedPricing) {
              const isStandard = !matchedPricing.pricingType || matchedPricing.pricingType === "Standard";
              
              if (isStandard) {
                // Find lowest > 0 in Standard Tiers
                const prices = [matchedPricing.tier1, matchedPricing.tier2, matchedPricing.tier3, matchedPricing.tier4].filter(p => p > 0);
                if (prices.length > 0) startingPrice = Math.min(...prices);
              } else {
                // Find lowest > 0 in Category Tiers (across Camp, Mid, and Lux)
                const prices = [
                  matchedPricing.campTier1, matchedPricing.campTier2, matchedPricing.campTier3, matchedPricing.campTier4,
                  matchedPricing.midTier1, matchedPricing.midTier2, matchedPricing.midTier3, matchedPricing.midTier4,
                  matchedPricing.luxTier1, matchedPricing.luxTier2, matchedPricing.luxTier3, matchedPricing.luxTier4
                ].filter(p => p && p > 0);
                if (prices.length > 0) startingPrice = Math.min(...prices);
              }
            }
            
            return {
              ...pkg,
              startingPrice,
            };
          });

          // Only show published packages
          setPackages(mergedPackages.filter(p => p.isPublished !== false));
        }
      } catch (error) {
        console.error("Failed to load packages or pricing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredPackages = packages.filter((pkg) => {
    if (activeFilter === "All Packages") return true;
    
    // Safely check category names (assuming category is a string or an object with a name)
    const categoryName = typeof pkg.category === "string" 
      ? pkg.category 
      : pkg.category?.name || "";
      
    return categoryName.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // --- CAROUSEL SCROLL LOGIC ---
  const totalPages = Math.ceil(filteredPackages.length / 3);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth; // Scroll by exactly one container width
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: pageIndex * scrollRef.current.clientWidth,
        behavior: "smooth"
      });
      setCurrentPage(pageIndex);
    }
  };

  // Sync dots when user manually swipes/scrolls
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const clientWidth = scrollRef.current.clientWidth;
      const newPage = Math.round(scrollLeft / clientWidth);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    }
  };

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeFilter]);

  return (
    <section className="w-full py-8 lg:py-20 bg-[#F6FBFB] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6">
        
        {/* --- SECTION HEADER --- */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="headingCSS text-3xl md:text-5xl font-extrabold text-[#135D66] tracking-tight mb-4">
            Explore Our <span className="text-[#fe6e00]">Adventures</span>
          </h2>
          
          <p className="descCSS text-center text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            From thrilling wildlife safaris in the Serengeti to conquering the peaks of Kilimanjaro, find the perfect itinerary tailored to your travel style.
          </p>

          {/* Dotted Airplane Graphic */}
          <div className="-mt-7">
              <Image src="/Title-Separator.png" alt="Image" className="w-117.5" width="470" height="70" loading="lazy" />
          </div>
        </div>

        {/* --- PACKAGES CONTAINER --- */}
        <div className="bg-[#E9F4F5] rounded-[30px] p-6 md:p-10 relative shadow-inner">
          
          {/* Filters */}
          <div className="headingCSS flex flex-wrap justify-center items-center gap-4 mb-10">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-[#135D66] text-white shadow-md"
                    : "bg-white text-[#135D66]/70 border border-[#135D66]/10 hover:bg-[#135D66]/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin"></div>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="headingCSS text-center py-20 text-gray-500 font-medium bg-white rounded-2xl">
              No packages found for this category.
            </div>
          ) : (
            <div className="relative w-full group">
              
              {/* Left Carousel Arrow */}
              {filteredPackages.length > 3 && (
                <button 
                  onClick={() => scroll("left")}
                  className="cursor-pointer absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hover:bg-gray-50 hidden md:flex border border-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}

              {/* Cards Scroll Container */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar scroll-smooth"
              >
                {filteredPackages.map((pkg, idx) => {
                  const categoryDisplay = typeof pkg.category === "string" ? pkg.category : pkg.category?.name || "safari";
                  
                  return (
                    <div 
                      key={idx} 
                      className="min-w-[100%] md:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(33.333%-1.5rem)] flex flex-col bg-white rounded-[24px] overflow-hidden snap-start shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
                    >
                      {/* Image Top Half */}
                      <div className="relative w-full h-[240px]">
                        <Image 
                          src={pkg.bannerImage}
                          alt={pkg.title} 
                          fill sizes="100vw" unoptimized className="object-cover" priority 
                        />
                      </div>
                      
                      {/* Content Bottom Half */}
                      <div className="p-6 flex flex-col flex-1">
                        
                        {/* Subtitle / Category line */}
                        <p className="descCSS text-sm text-gray-500 font-medium mb-2">
                          {pkg.badgeText}
                        </p>
                        
                        {/* Title */}
                        <h3 className="headingCSS text-xl font-bold text-gray-900 leading-snug mb-6 flex-1">
                          {pkg.title}
                        </h3>

                        {/* Price & Action Row */}
                        <div className="descCSS flex items-end justify-between mt-auto pt-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 mb-0.5">Starts from</span>
                            <span className="text-2xl font-extrabold text-black leading-none mb-1">
                              ${pkg.startingPrice || "N/A"}
                            </span>
                            <span className="text-sm text-gray-500">Per person</span>
                          </div>
                          
                          <Link 
                            href={getLocalizedUrl(`/${pkg.slug || ""}`)} 
                            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-bold text-sm transition-colors bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white"
                          >
                            View Trip
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Carousel Arrow */}
              {filteredPackages.length > 3 && (
                <button 
                  onClick={() => scroll("right")}
                  className="cursor-pointer absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hover:bg-gray-50 hidden md:flex border border-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}

              {/* --- PAGINATION DOTS --- */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2.5 mt-4">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToPage(idx)}
                      className={`cursor-pointer h-3 rounded-full transition-all duration-300 ${
                        currentPage === idx ? "w-8 bg-[#fe6e00]" : "w-3 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Hide default scrollbar but retain swipe/scroll capabilities */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </section>
  );
}
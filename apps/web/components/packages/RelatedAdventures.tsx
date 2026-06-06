// apps/web/components/packages/RelatedAdventures.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocalizedUrl } from "../../hooks/useLocalizedUrl";
import { apiFetch } from "../../lib/apiClient";

interface RelatedAdventuresProps {
  currentCategory: string;
  currentPackageTitle: string;
}

export default function RelatedAdventures({ currentCategory, currentPackageTitle }: RelatedAdventuresProps) {
  const { getLocalizedUrl } = useLocalizedUrl();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Carousel State
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    otherPackage: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // monthYear: "",
    // tripDays: "",
    message: ""
  });

  const categoryStr = currentCategory?.toLowerCase() || "";
  const isClimbing = categoryStr.includes("climbing");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pkgResult, pricingResult] = await Promise.all([
          apiFetch("/packages"),
          apiFetch("/pricing"),
        ]);

        if (pkgResult.ok && Array.isArray(pkgResult.data)) {
          // const mergedPackages = pkgResult.data.map((pkg: any) => {
          //   const matchedPricing = Array.isArray(pricingResult.data) 
          //     ? pricingResult.data.find((p: any) => p.packageId === pkg.id) 
          //     : null;
          //   return { ...pkg, startingPrice: matchedPricing?.tier1 || null };
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
                // Find lowest > 0 in Category Tiers
                const prices = [
                  matchedPricing.campTier1, matchedPricing.campTier2, matchedPricing.campTier3, matchedPricing.campTier4,
                  matchedPricing.midTier1, matchedPricing.midTier2, matchedPricing.midTier3, matchedPricing.midTier4,
                  matchedPricing.luxTier1, matchedPricing.luxTier2, matchedPricing.luxTier3, matchedPricing.luxTier4
                ].filter(p => p && p > 0);
                if (prices.length > 0) startingPrice = Math.min(...prices);
              }
            }

            return { ...pkg, startingPrice };
          });

          const targetPackages = mergedPackages.filter((p: any) => {
            if (p.isPublished === false) return false;
            const cat = (typeof p.category === "string" ? p.category : p.category?.name || "").toLowerCase();
            
            // Return true if the package category does NOT match the current category
            return cat && !cat.includes(categoryStr) && !categoryStr.includes(cat);
          });

          setPackages(targetPackages);
        }
      } catch (error) {
        console.error("Failed to load related packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryStr]);

  if (!isLoading && packages.length === 0) {
    return null; 
  }

  const title = "Add an Adventure";
  const subtitle = isClimbing 
    ? "Turn your summit into a full Tanzania adventure." 
    : "Discover more of Tanzania to complete your journey.";
  const buttonText = "BUILD YOUR ADVENTURE";

  // --- CAROUSEL SCROLL LOGIC ---
  const totalPages = Math.ceil(packages.length / 3); // Assuming 3 items per view on desktop

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullMessage = `Combo Trip Request:
Base Package: ${currentPackageTitle}
Added Package: ${formData.otherPackage}

Message: 
${formData.message}`;

    const payload = {
      bookingType: "Combo",
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      packageName: `${currentPackageTitle} + ${formData.otherPackage}`,
      // monthYear: formData.monthYear,
      // tripDays: formData.tripDays,
      message: fullMessage
    };

    try {
      const { ok } = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        // 1. Show the success message immediately
        setSuccess(true);
        
        // 2. Wait 3 seconds, then close and reset everything
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(false);
          setFormData({ 
            otherPackage: "", 
            firstName: "", 
            lastName: "", 
            email: "", 
            phone: "", 
            // monthYear: "", 
            // tripDays: "", 
            message: "" 
          });
        }, 3000);

      } else {
        alert("Failed to send request. Please try again.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />

      <section className="py-16 lg:py-24 bg-[#f9fafb] border-b border-gray-100 reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                {title.split(" ")[0]} {title.split(" ")[1]} <span className="text-[#fe6e00]">{title.split(" ")[2]}</span>
              </h2>
              <p className="text-gray-600 text-lg">
                {subtitle}
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#fe6e00] hover:bg-[#fe6e00]/70 cursor-pointer text-white font-bold py-3 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 shadow-md"
            >
              {buttonText}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#fe6e00] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="relative w-full group">
              
              {/* --- LEFT ARROW --- */}
              {packages.length > 3 && (
                <button 
                  onClick={() => scroll("left")}
                  className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hover:bg-gray-50 border border-gray-100 hidden sm:flex"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}

              {/* SMOOTH SCROLLING CONTAINER */}
              <div 
                ref={scrollRef} 
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar scroll-smooth"
              >
                {packages.map((pkg, idx) => (
                  <div 
                    key={pkg.id || idx} 
                    className="min-w-[100%] md:min-w-[calc(50%-0.75rem)] lg:min-w-[calc(33.333%-1rem)] flex flex-col bg-white rounded-[24px] overflow-hidden snap-start shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-xl"
                  >
                    <div className="relative w-full h-[240px]">
                      <Image 
                        src={pkg.bannerImage || pkg.heroImage || "/placeholder.jpg"}
                        alt={pkg.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw" 
                        unoptimized 
                        className="object-cover" 
                        priority={idx === 0}
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-sm text-gray-500 font-medium mb-2">
                        {pkg.badgeText || `${pkg.length || 3} Days`}
                      </p>
                      
                      <h3 className="text-xl font-bold text-gray-900 leading-snug mb-6 flex-1">
                        {pkg.title}
                      </h3>

                      <div className="flex items-end justify-between mt-auto pt-2">
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
                ))}
              </div>

              {/* --- RIGHT ARROW --- */}
              {packages.length > 3 && (
                <button 
                  onClick={() => scroll("right")}
                  className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hover:bg-gray-50 border border-gray-100 hidden sm:flex"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}

              {/* --- PAGINATION DOTS --- */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2.5 mt-6">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToPage(idx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
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
      </section>

      {/* ========================================== */}
      {/* COMBO BOOKING MODAL                        */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-fade-in">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-[#F6FBFB] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-extrabold text-[#135D66]">Build Your Adventure</h3>
                <p className="text-sm text-gray-500 mt-1">Combine packages for the ultimate experience.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50">✕</button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
              <p className="text-gray-600">Our team will get back to you shortly.</p>
            </div>
          ) : (
              <form id="combo-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Package Selections */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Current Package</label>
                    <input type="text" readOnly value={currentPackageTitle} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium outline-none cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#fe6e00] uppercase tracking-wide mb-1">Select Adventure to Add *</label>
                    <select 
                      required 
                      value={formData.otherPackage} 
                      onChange={e => setFormData({...formData, otherPackage: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00]"
                    >
                      <option value="" disabled>Choose an adventure...</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">First Name *</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Email Address *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00]" />
                  </div>
                </div>

                {/* Travel Details */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Expected Month & Year</label>
                    <input 
                      type="month" 
                      min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                      value={formData.monthYear} 
                      onChange={e => setFormData({...formData, monthYear: e.target.value})} 
                      className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00] bg-white text-gray-700 uppercase" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Total Trip Days</label>
                    <input type="number" min="1" value={formData.tripDays} onChange={e => setFormData({...formData, tripDays: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00]" />
                  </div>
                </div> */}

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Additional Notes</label>
                  <textarea rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#fe6e00] resize-none"></textarea>
                </div>

              </form>
          )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-full transition-colors">
                  Cancel
                </button>
                <button type="submit" form="combo-form" disabled={isSubmitting} className="px-8 py-2.5 bg-[#fe6e00] hover:bg-[#fe6e00]/70 cursor-pointer text-white font-bold rounded-full transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Sending..." : "Submit Request"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
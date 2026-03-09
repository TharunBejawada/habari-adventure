// apps/web/components/HolidayPackages.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function HolidayPackages() {
  const [activeFilter, setActiveFilter] = useState("All Packages");

  const filters = ["All Packages", "Honeymoon", "Family", "Luxury"];

  const packages = [
    {
      title: "Serengeti + Zanzibar Beach",
      image: "/holiday-1.jpg",
      category: "All Packages",
    },
    {
      title: "Honeymoon Safari Packages",
      image: "/holiday-2.jpg",
      category: "Honeymoon",
    },
    {
      title: "Family Safari & Relaxation",
      image: "/holiday-3.jpg",
      category: "Family",
    },
    {
      title: "Private Luxury Safari",
      image: "/holiday-4.jpg",
      category: "Luxury",
    },
  ];

  return (
    <section className="w-full py-20 lg:py-32 bg-[#F6FBFB] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6">
        
        {/* --- SECTION HEADER --- */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#135D66] tracking-tight mb-4">
            Safari + <span className="text-[#E59A1D]">Zanzibar</span> Holiday Packages
          </h2>
          
          <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            After your adventure-filled wildlife safari Tanzania or Kilimanjaro climbing journey, unwind on the white-sand beaches of Zanzibar. Our combined Tanzania safari packages include carefully curated experiences.
          </p>

          {/* Dotted Airplane Graphic */}
          <div className="mt-8 mb-4 opacity-40">
            <svg width="250" height="40" viewBox="0 0 250 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 Q 125 -10, 240 30" stroke="#135D66" strokeWidth="2" strokeDasharray="6 6" fill="none" />
              <path d="M235 25 L 245 30 L 235 35 Z" fill="#135D66" transform="rotate(-15 240 30)" />
            </svg>
          </div>
        </div>

        {/* --- PACKAGES CONTAINER (The Light Inner Box) --- */}
        <div className="bg-[#E9F4F5] rounded-[30px] p-6 md:p-10 relative shadow-inner">
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-[#135D66] text-white shadow-md"
                    : "bg-white text-[#135D66]/70 border border-[#135D66]/10 hover:bg-[#135D66]/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Carousel / Grid Wrapper */}
          <div className="relative w-full group">
            
            {/* Left Carousel Arrow (Decorative/UI) */}
            <button className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#E59A1D] hover:bg-[#D48A18] text-white rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hidden md:flex">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Cards Scroll Container */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar">
              {packages.map((pkg, idx) => (
                <div 
                  key={idx} 
                  className="min-w-[280px] md:min-w-[350px] flex-1 relative h-[300px] md:h-[350px] rounded-2xl overflow-hidden snap-center group/card cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300"
                >
                  {/* Card Image */}
                  <Image 
                    src={pkg.image} 
                    alt={pkg.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110" 
                  />
                  
                  {/* Glassmorphism Bottom Bar */}
                  <div className="absolute bottom-0 left-0 w-full h-[80px] bg-white/20 backdrop-blur-md border-t border-white/30 flex items-center justify-center p-4 translate-y-0 transition-all duration-300">
                    <h4 className="text-white font-bold text-lg md:text-xl text-center drop-shadow-md leading-tight">
                      {pkg.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Carousel Arrow (Decorative/UI) */}
            <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#E59A1D] hover:bg-[#D48A18] text-white rounded-full flex items-center justify-center shadow-lg z-20 transition-transform transform hover:scale-110 hidden md:flex">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

          </div>
        </div>

      </div>

      {/* Global style to hide the ugly scrollbar on the carousel but keep functionality */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </section>
  );
}
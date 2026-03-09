// apps/web/components/BottomCTA.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function BottomCTA() {
  return (
    <section className="w-full px-4 sm:px-6 py-12 md:py-20 relative z-10">
      
      {/* The Container: 
        Uses a beautiful dark-to-light gradient (left to right) to match the design.
      */}
      <div className="max-w-[1400px] mx-auto w-full lg:w-[96%] bg-gradient-to-r from-[#071D2B] via-[#0E4950] to-[#128EB0] rounded-[30px] p-6 sm:p-8 md:p-14 lg:p-20 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* --- LEFT SIDE: Text Content --- */}
        <div className="w-full lg:w-[50%] relative z-20 text-center lg:text-left">
          
          <h3 className={`${caveat.className} text-[#E59A1D] text-3xl md:text-4xl mb-2 md:mb-3 tracking-wide`}>
            Built On Trust
          </h3>
          
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-md">
            Ready to Begin Your African Safari?
          </h2>

          <div className="text-white/90 text-sm md:text-base leading-relaxed mb-8 space-y-4 max-w-lg mx-auto lg:mx-0 text-left">
            <p>Whether you dream of:</p>
            <ul className="space-y-2 ml-2">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#E59A1D] shrink-0"></span>
                <span>A breathtaking Serengeti safari</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#E59A1D] shrink-0"></span>
                <span>A life-changing Kilimanjaro climbing adventure</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#E59A1D] shrink-0"></span>
                <span>A luxury Tanzania safari package</span>
              </li>
            </ul>
            <p className="pt-2">
              Habari Adventure is here to guide you. Let us craft a personalized journey designed around your timeline, budget, and travel vision.
            </p>
          </div>

          <Link 
            href="/contact" 
            className="inline-block bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-bold text-base md:text-lg py-3 md:py-4 px-6 md:px-10 rounded-full transition-transform hover:scale-105 shadow-lg shadow-[#98D80D]/20 text-center"
          >
            Start your Tanzania safari tours today
          </Link>
        </div>

        {/* --- RIGHT SIDE: Polaroid Collage --- */}
        {/* Adjusted height for mobile: h-[320px], sm:h-[400px], md:h-[500px] */}
        <div className="w-full lg:w-[50%] relative h-[320px] sm:h-[400px] md:h-[500px] flex items-center justify-center z-20 mt-4 lg:mt-0">
          
          {/* Abstract Colored Background Blocks */}
          <div className="absolute top-[40%] right-[5%] md:right-[10%] w-[60%] h-[40%] bg-[#E59A1D] transform rotate-6 rounded-lg opacity-90 z-0"></div>
          <div className="absolute top-[30%] left-[10%] md:left-[20%] w-[50%] h-[50%] bg-[#0A7391] transform -rotate-12 rounded-lg opacity-90 z-0"></div>

          {/* Polaroid 1 (Left - Tilted Left) */}
          {/* Scaled widths/heights for mobile vs desktop */}
          <div className="absolute left-0 sm:left-[5%] md:left-[15%] top-[25%] w-[110px] sm:w-[160px] md:w-[200px] h-[150px] sm:h-[220px] md:h-[280px] bg-white p-1.5 sm:p-2 pb-6 sm:pb-8 md:pb-10 rounded-sm shadow-xl transform -rotate-[10deg] hover:rotate-0 hover:z-30 transition-all duration-300 z-10">
            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
               <Image src="/safari-1.jpg" alt="Safari Experience" fill className="object-cover" />
            </div>
          </div>

          {/* Polaroid 2 (Center - Straight & Largest) */}
          <div className="absolute left-[28%] sm:left-[30%] md:left-[35%] top-[10%] w-[130px] sm:w-[180px] md:w-[240px] h-[170px] sm:h-[250px] md:h-[340px] bg-white p-1.5 sm:p-2 md:p-3 pb-7 sm:pb-10 md:pb-12 rounded-sm shadow-2xl transform rotate-2 hover:-translate-y-2 hover:rotate-0 transition-all duration-300 z-20">
            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
               <Image src="/safari-2.jpg" alt="Climbing Adventure" fill className="object-cover" />
            </div>
          </div>

          {/* Polaroid 3 (Right - Tilted Right) */}
          <div className="absolute right-0 sm:right-[5%] md:right-[10%] top-[30%] w-[100px] sm:w-[150px] md:w-[190px] h-[130px] sm:h-[200px] md:h-[260px] bg-white p-1.5 sm:p-2 pb-6 sm:pb-8 rounded-sm shadow-xl transform rotate-[12deg] hover:rotate-0 hover:z-30 transition-all duration-300 z-10">
            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
               <Image src="/safari-3.jpg" alt="Zanzibar Leisure" fill className="object-cover" />
            </div>
          </div>

          {/* Floating Decorative Clouds (Scaled for mobile) */}
          <div className="absolute -bottom-6 sm:-bottom-10 left-[-5%] w-[80px] sm:w-[120px] md:w-[160px] z-30 opacity-90 animate-pulse">
            <Image src="/Cloud1.png" alt="Cloud" width={168} height={131} className="w-full h-auto" />
          </div>
          <div className="absolute -top-6 sm:-top-10 right-0 w-[70px] sm:w-[100px] md:w-[130px] z-10 opacity-80">
            <Image src="/Cloud2.png" alt="Cloud" width={168} height={131} className="w-full h-auto" />
          </div>

        </div>

      </div>
    </section>
  );
}
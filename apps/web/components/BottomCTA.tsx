// apps/web/components/BottomCTA.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Caveat } from "next/font/google";
import { useLocalizedUrl } from "../hooks/useLocalizedUrl";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function BottomCTA() {
  const { getLocalizedUrl } = useLocalizedUrl();
  return (
    <section className="w-full px-4 sm:px-6 py-12 md:py-20 relative z-10">
      
      {/* The Container: 
        Uses a beautiful dark-to-light gradient (left to right) to match the design.
      */}
      <div className="max-w-[1400px] mx-auto w-full lg:w-[96%] bg-gradient-to-r from-[#071D2B] via-[#0E4950] to-[#128EB0] rounded-[30px] p-6 sm:p-8 md:p-14 lg:p-20 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* --- LEFT SIDE: Text Content --- */}
        <div className="w-full lg:w-[50%] relative z-20 text-center lg:text-left">
          
          <h3 className={`${caveat.className} text-3xl md:text-4xl text-[#fe6e00] block mb-2 tracking-normal`}>
            Built On Trust
          </h3>
          
          <h2 className="headingCSS text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-md">
            Ready to Begin Your <span className="text-[#fe6e00]">African Safari</span>?
          </h2>

          <div className="descCSS text-left text-white/90 text-sm md:text-base leading-relaxed mb-8 space-y-4 max-w-lg mx-auto lg:mx-0 text-left">
            <p>Whether you dream of:</p>
            <ul className="space-y-2 ml-2">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#fe6e00] shrink-0"></span>
                <span>A breathtaking Serengeti safari</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#fe6e00] shrink-0"></span>
                <span>A life-changing Kilimanjaro climbing adventure</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#fe6e00] shrink-0"></span>
                <span>A luxury Tanzania safari package</span>
              </li>
            </ul>
            <p className="pt-2">
              Habari Adventure is here to guide you. Let us craft a personalized journey designed around your timeline, budget, and travel vision.
            </p>
          </div>

          <div className="flex flex-wrap items-left justify-left gap-4">
  {/* Primary CTA (Original Width) */}
  <Link 
    href={getLocalizedUrl("/contact")} 
    className="inline-block bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white font-bold text-base md:text-lg py-3 md:py-4 px-6 md:px-10 rounded-full transition-transform hover:scale-105 shadow-lg shadow-[#fe6e00]/20 text-center"
  >
    Start your Adventures today
  </Link>

  {/* WhatsApp Secondary CTA (Natural Width) */}
  <a 
    href="https://wa.me/255762992308" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="inline-flex items-center justify-center bg-[#fe6e00] text-white hover:bg-[#fe6e00]/70 hover:text-white font-bold text-base md:text-lg py-2.5 md:py-3.5 px-6 md:px-10 rounded-full transition-transform hover:scale-105 shadow-lg shadow-[#25D366]/20 text-center gap-2"
  >
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
    Chat via WhatsApp
  </a>
</div>
        </div>

        {/* --- RIGHT SIDE: Polaroid Collage --- */}
        {/* Adjusted height for mobile: h-[320px], sm:h-[400px], md:h-[500px] */}
        <div className="w-full lg:w-[50%] relative h-[320px] sm:h-[400px] md:h-[500px] flex items-center justify-center z-20 mt-4 lg:mt-0">
          
          {/* Abstract Colored Background Blocks */}
          <div className="absolute top-[40%] right-[5%] md:right-[10%] w-[60%] h-[40%] bg-[#fe6e00] transform rotate-6 rounded-lg opacity-90 z-0"></div>
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
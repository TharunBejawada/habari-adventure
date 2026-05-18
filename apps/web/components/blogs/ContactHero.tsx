// apps/web/components/contact/ContactHero.tsx
"use client";

import Image from "next/image";
import { Caveat } from "next/font/google";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"; // Importing proper icons

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function ContactHero() {
  return (
    <section className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden -mt-[120px] z-0">
      
      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Text Animations */
          @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-fade-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

          /* Cloud: Straight horizontal */
          @keyframes moveCloudContact {
            0% { transform: translateX(-20vw); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateX(110vw); opacity: 0; }
          }
          .animate-cloud-horizontal { animation: moveCloudContact 40s linear infinite; }

          /* Plane: Top left to right slightly diagonal */
          @keyframes movePlaneDiag {
            0% { transform: translate(-20vw, -5vh) rotate(15deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translate(110vw, 15vh) rotate(15deg); opacity: 0; }
          }
          .animate-plane-diagonal { animation: movePlaneDiag 25s linear infinite; }

          /* Balloons: Opposite vertical floating */
          @keyframes floatUp {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          @keyframes floatDown {
            0%, 100% { transform: translateY(-30px); }
            50% { transform: translateY(0); }
          }
          .animate-balloon-1 { animation: floatUp 6s ease-in-out infinite; }
          .animate-balloon-2 { animation: floatDown 7s ease-in-out infinite; }
        `
      }} />

      {/* --- BACKGROUND MOUNTAINS --- */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/contact-mountains.png" 
          alt="Mountains Background" 
          fill 
          className="object-cover object-bottom opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
      </div>

      {/* --- ANIMATED FLOATING ELEMENTS --- */}
      
      {/* 1. Cloud (Increased Size) */}
      <div className="absolute top-[25%] lg:top-[30%] w-full z-10 pointer-events-none">
        <div className="inline-block animate-cloud-horizontal">
          <Image src="/Cloud3.png" alt="Cloud" width={320} height={183} sizes="(max-width: 768px) 180px, 320px" className="w-[180px] md:w-[320px] opacity-80" />
        </div>
      </div>

      {/* 2. Plane */}
      <div className="absolute top-[10%] lg:top-[15%] w-full z-10 pointer-events-none">
        <div className="inline-block animate-plane-diagonal">
          <Image src="/plane.png" alt="Airplane" width={300} height={150} sizes="(max-width: 768px) 180px, 300px" className="w-[180px] md:w-[300px] drop-shadow-xl" />
        </div>
      </div>

      {/* 3. Hot Air Balloons - Positioned to the far right screen edge */}
      <div className="absolute top-[10%] right-0 lg:right-5 z-10 pointer-events-none hidden md:block">
        <div className="relative w-[200px] h-[350px]">
          {/* Blue Balloon - Increased Size */}
          <div className="absolute top-0 right-14 animate-balloon-1">
            <Image src="/balloon-blue.png" alt="Hot Air Balloon" width={130} height={176} sizes="(max-width: 1024px) 100px, 130px" className="w-[100px] lg:w-[130px] drop-shadow-xl" />
          </div>
          {/* Red Balloon - Slightly increased to match proportion */}
          <div className="absolute top-32 right-[-10px] animate-balloon-2">
            <Image src="/balloon-red.png" alt="Hot Air Balloon" width={90} height={130} sizes="(max-width: 1024px) 70px, 90px" className="w-[70px] lg:w-[90px] drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* --- MAIN HERO CONTENT --- */}
      <div className="max-w-[1000px] mx-auto w-[96%] relative z-20 flex flex-col items-center text-center px-4">
        
        {/* Main Title with Caveat Accent */}
        <h1 className="animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#fe6e00] mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
          Explore <span className={`${caveat.className} text-[#E59A1D] font-normal`}>The World</span>
        </h1>

        {/* Paragraph Content - Normal font, readable formatting */}
        <p className="animate-fade-left font-medium text-gray-200 text-sm md:text-base leading-relaxed max-w-3xl mb-12 drop-shadow-md" style={{ animationDelay: '0.3s' }}>
          Read our latest travel guides, tips, and stories from the heart of Tanzania.
        </p>

      </div>
    </section>
  );
}
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
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
      </div>

      {/* --- ANIMATED FLOATING ELEMENTS --- */}
      
      {/* 1. Cloud (Increased Size) */}
      <div className="absolute top-[25%] lg:top-[30%] w-full z-10 pointer-events-none">
        <div className="inline-block animate-cloud-horizontal">
          <Image src="/Cloud3.png" alt="Cloud" width={350} height={200} className="w-[180px] md:w-[320px] opacity-80" />
        </div>
      </div>

      {/* 2. Plane */}
      <div className="absolute top-[10%] lg:top-[15%] w-full z-10 pointer-events-none">
        <div className="inline-block animate-plane-diagonal">
          <Image src="/plane.png" alt="Airplane" width={300} height={150} className="w-[180px] md:w-[300px] drop-shadow-xl" />
        </div>
      </div>

      {/* 3. Hot Air Balloons - Positioned to the far right screen edge */}
      <div className="absolute top-[10%] right-0 lg:right-5 z-10 pointer-events-none hidden md:block">
        <div className="relative w-[200px] h-[350px]">
          {/* Blue Balloon - Increased Size */}
          <div className="absolute top-0 right-14 animate-balloon-1">
            <Image src="/balloon-blue.png" alt="Hot Air Balloon" width={140} height={190} className="w-[100px] lg:w-[130px] drop-shadow-xl" />
          </div>
          {/* Red Balloon - Slightly increased to match proportion */}
          <div className="absolute top-32 right-[-10px] animate-balloon-2">
            <Image src="/balloon-red.png" alt="Hot Air Balloon" width={90} height={130} className="w-[70px] lg:w-[90px] drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* --- MAIN HERO CONTENT --- */}
      <div className="max-w-[1000px] mx-auto w-[96%] relative z-20 flex flex-col items-center text-center px-4">
        
        {/* Main Title with Caveat Accent */}
        <h1 className="animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#135D66] mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
          Contact <span className={`${caveat.className} text-[#E59A1D] font-normal`}>Habari Adventure</span>
        </h1>

        {/* Paragraph Content - Normal font, readable formatting */}
        <p className="animate-fade-left font-medium text-gray-800 text-sm md:text-base leading-relaxed max-w-3xl mb-12 drop-shadow-md" style={{ animationDelay: '0.3s' }}>
          Planning a Tanzania trip—Kilimanjaro + Safari + Zanzibar? Share a few details and we’ll recommend the best sequence, routes, parks, and beach stay, then send a complete plan with pricing, inclusions, and logistics so you can book with confidence. From the mountain to the savannah to the sea, we coordinate your climb (private or group departures), safari, and beach days into one smooth schedule—including transfers, accommodations, and timing—with straightforward communication and transparent costs.
        </p>

        {/* Quick Contact Info with Clickable Actions */}
        <div className="animate-fade-right flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 bg-white/80 backdrop-blur-md px-8 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white" style={{ animationDelay: '0.4s' }}>
          
          {/* Action 1: WhatsApp / Call */}
          <a 
            href="https://wa.me/255762992308" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 group-hover:bg-[#25D366]/20 transition-colors flex items-center justify-center text-[#25D366]">
              <FaWhatsapp className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp / Phone</span>
              <span className="block text-[#135D66] font-bold group-hover:text-[#25D366] transition-colors">+255 762 992 308</span>
            </div>
          </a>

          <div className="hidden sm:block w-px h-12 bg-gray-300/50"></div>

          {/* Action 2: Email */}
          <a 
            href="mailto:habariadventure@gmail.com" 
            className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-[#E59A1D]/10 group-hover:bg-[#E59A1D]/20 transition-colors flex items-center justify-center text-[#E59A1D]">
              <FaEnvelope className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email</span>
              <span className="block text-[#135D66] font-bold group-hover:text-[#E59A1D] transition-colors">habariadventure@gmail.com</span>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
}
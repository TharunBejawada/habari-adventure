// apps/web/components/AboutSection.tsx
"use client";

import Image from "next/image";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function AboutSection() {
  return (
    <>
      {/* --- CSS ANIMATIONS FOR LOADING --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0; /* Starts hidden before animation kicks in */
          }
        `
      }} />

      {/* --- ABOUT SECTION --- */}
      {/* -mt-24 lg:-mt-32 pulls this section underneath the Hero Stats Bar 
          pt-32 lg:pt-48 ensures the text starts BELOW the overlap 
      */}
      <section className="w-full pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#FDFEFE] relative overflow-hidden -mt-12 lg:-mt-20 z-10">
        
        <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* --- LEFT SIDE: Text & Grid --- */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left z-20">
            
            {/* Animated Headline Group */}
            <div className="animate-fade-in-up w-full" style={{ animationDelay: '0.1s' }}>
              <span className={`${caveat.className} text-3xl md:text-4xl text-[#E59A1D] block mb-2 tracking-wider`}>
                Discover Our Story
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
                About <span className="text-[#135D66]">Habari Adventure</span>
              </h2>
            </div>

            {/* Animated About Text */}
            <div className="animate-fade-in-up text-gray-600 text-sm sm:text-base leading-relaxed space-y-4 mb-10 max-w-2xl" style={{ animationDelay: '0.2s' }}>
              <p>
                Founded in 2012, Habari Adventure is a locally operated company based in Tanzania, serving travelers worldwide seeking authentic African safari experiences. Our mission is to combine adventure, conservation, and cultural respect.
              </p>
              <p>
                We work closely with local communities, national park authorities, and certified guides to ensure that every wildlife safari Tanzania experience is ethical and sustainable. With thousands of successful expeditions, we are proud to be recognized among trusted providers of Tanzania safari tours and Kilimanjaro climbing adventures.
              </p>
            </div>

            {/* Animated How It Works Header */}
            <div className="animate-fade-in-up w-full flex items-center justify-center lg:justify-start gap-4 mb-10" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-2xl font-bold text-[#135D66]">How It Works</h3>
              <span className="h-[2px] bg-[#E59A1D]/30 flex-1 max-w-[100px] lg:max-w-[200px] rounded-full"></span>
            </div>

            {/* Animated 2x2 Grid for Steps */}
            <div className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-12 w-full max-w-2xl" style={{ animationDelay: '0.4s' }}>
              
              {/* Step 01 */}
              <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center mt-4 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#135D66] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white group-hover:bg-[#E59A1D] transition-colors duration-300">
                  01
                </div>
                <svg className="w-10 h-10 text-[#E59A1D] mb-3 mt-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <h4 className="font-bold text-[#135D66] mb-2 text-lg">Share your travel goals</h4>
              </div>

              {/* Step 02 */}
              <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center mt-4 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#135D66] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white group-hover:bg-[#E59A1D] transition-colors duration-300">
                  02
                </div>
                <svg className="w-10 h-10 text-[#E59A1D] mb-3 mt-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <h4 className="font-bold text-[#135D66] mb-2 text-lg">Receive customized package</h4>
              </div>

              {/* Step 03 */}
              <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center mt-4 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#135D66] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white group-hover:bg-[#E59A1D] transition-colors duration-300">
                  03
                </div>
                <svg className="w-10 h-10 text-[#E59A1D] mb-3 mt-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 className="font-bold text-[#135D66] mb-2 text-lg">Confirm your itinerary</h4>
              </div>

              {/* Step 04 */}
              <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center mt-4 group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#135D66] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white group-hover:bg-[#E59A1D] transition-colors duration-300">
                  04
                </div>
                <svg className="w-10 h-10 text-[#E59A1D] mb-3 mt-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 className="font-bold text-[#135D66] mb-2 text-lg">Travel confidently with local support</h4>
              </div>

            </div>

            {/* Animated Bottom Alert / Note */}
            <div className="animate-fade-in-up mt-10 inline-flex items-center justify-center lg:justify-start gap-3 px-5 py-3 rounded-full bg-[#E59A1D]/10 border border-[#E59A1D]/20 w-full sm:w-auto" style={{ animationDelay: '0.5s' }}>
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E59A1D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E59A1D]"></span>
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#135D66] text-left">
                Our team responds within <span className="text-[#E59A1D] font-bold">3 hours</span> with tailored recommendations.
              </p>
            </div>

          </div>

          {/* --- RIGHT SIDE: Image --- */}
          {/* FIX: Changed min-h to strict h-[...] so next/image knows exactly how big the container is */}
          <div className="animate-fade-in-up w-full lg:w-1/2 relative h-[400px] sm:h-[500px] lg:h-[700px] flex justify-center lg:justify-end mt-12 lg:mt-0" style={{ animationDelay: '0.6s' }}>
            
            <div className="relative w-full h-full">
              {/* NOTE: Make sure your image name below perfectly matches the file in your public folder! */}
              <Image 
                src="/about-mountain.png" 
                alt="About Habari Adventure" 
                fill
                className="object-contain lg:object-right drop-shadow-2xl"
                priority={false}
              />
            </div>

            {/* Decorative background circle behind the image */}
            <div className="absolute top-[10%] right-0 w-[70%] h-[70%] bg-[#E8F2F2] rounded-full blur-3xl -z-10 opacity-70"></div>
          </div>

        </div>
      </section>
    </>
  );
}
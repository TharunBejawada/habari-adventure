// apps/web/components/WhyChooseUs.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function WhyChooseUs() {
  const features = [
    "13+ years of experience in Tanzania safari tours",
    "Licensed and certified mountain crew for Kilimanjaro",
    "Handpicked luxury lodges and eco-camps",
    "Strong focus on responsible and eco-conscious tourism",
    "High summit success rates on Kilimanjaro tours",
    "Personalized itineraries tailored to your travel style"
  ];

  return (
    <section className="w-full py-20 lg:py-32 bg-[#FDFEFE] relative overflow-hidden">
      
      {/* CSS Animation for the floating airplane */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes floatPlane {
            0% { transform: translate(0px, 0px) rotate(10deg); }
            50% { transform: translate(15px, -15px) rotate(12deg); }
            100% { transform: translate(0px, 0px) rotate(10deg); }
          }
          .animate-float-plane {
            animation: floatPlane 6s ease-in-out infinite;
          }
        `
      }} />

      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-12 relative">
        
        {/* --- LEFT SIDE: Image Composition --- */}
        <div className="w-full lg:w-1/2 relative h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center z-10">
          
          {/* Back Left Image (Rounded Rectangle) */}
          <div className="absolute left-0 top-[10%] w-[45%] h-[65%] rounded-[40px] overflow-hidden shadow-lg">
            <Image src="/choose-1.jpg" alt="Hiking in Tanzania" fill className="object-cover" />
          </div>

          {/* Back Right Image (Rounded Rectangle - Offset lower) */}
          <div className="absolute right-[10%] bottom-[5%] w-[45%] h-[65%] rounded-[40px] overflow-hidden shadow-lg">
            <Image src="/choose-3.jpg" alt="Safari Tour" fill className="object-cover" />
          </div>

          {/* Center Circular Image (Overlaps the others) */}
          <div className="absolute left-[20%] top-[25%] w-[55%] aspect-square rounded-full border-[12px] md:border-[16px] border-white overflow-hidden shadow-2xl z-20">
            <Image src="/choose-2.jpg" alt="Beautiful Destination" fill className="object-cover" />
          </div>

          {/* Floating Airplane */}
          <div className="absolute top-[5%] right-[25%] w-[120px] md:w-[180px] z-30 animate-float-plane">
            <Image src="/plane.png" alt="Airplane" width={180} height={100} className="w-full h-auto drop-shadow-xl" />
          </div>
          
        </div>

        {/* --- RIGHT SIDE: Text Content --- */}
        <div className="w-full lg:w-1/2 flex flex-col items-start relative z-10 lg:pr-16">
          
          {/* Rotated Experience Text (Visible on LG screens and up) */}
          <div className="hidden xl:flex absolute right-[-60px] top-[40%] origin-bottom-right rotate-90 items-center gap-3 tracking-widest">
            <span className="text-5xl font-black text-[#E59A1D]">13</span>
            <span className="text-xl font-bold text-[#135D66] uppercase tracking-[0.2em] whitespace-nowrap">
              Years of <br /> Experience
            </span>
          </div>

          <span className="text-[#E59A1D] font-bold tracking-widest uppercase text-sm mb-3">
            Why Choose Habari Adventure
          </span>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#135D66] leading-tight mb-6">
            A Certified & Trusted <br className="hidden lg:block" />
            <span className="text-[#E59A1D]">Tour Operator</span> in Tanzania
          </h2>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
            Choosing the right tour operator in Tanzania is the most important decision for your African adventure. At Habari Adventure, we combine local expertise, safety standards, and premium service to create authentic Tanzania safari packages and mountain expeditions.
          </p>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
            Our team operates from Tanzania, with deep knowledge of Serengeti ecosystems, Ngorongoro Crater wildlife patterns, and Kilimanjaro trekking routes including Machame, Lemosho, and Marangu.
          </p>

          <h3 className="text-xl font-bold text-[#135D66] mb-5 border-l-4 border-[#E59A1D] pl-3">
            What Sets Us Apart
          </h3>

          {/* Feature List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 w-full mb-10">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#135D66]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#E59A1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 leading-snug">{feature}</span>
              </div>
            ))}
          </div>

          {/* Bottom Action Row (Button + Avatars) */}
          <div className="flex flex-wrap items-center gap-8 border-t border-gray-200 pt-8 w-full">
            <Link 
              href="/tours" 
              className="bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-bold text-base py-3 px-8 rounded-full transition-transform hover:-translate-y-1 shadow-lg shadow-[#98D80D]/20"
            >
              Discover More
            </Link>

            {/* Happy Customers Stats */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {/* Replace with tiny avatar images or use these placeholders */}
                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white overflow-hidden relative"><Image src="/safari-1.jpg" alt="Customer" fill className="object-cover" /></div>
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white overflow-hidden relative"><Image src="/safari-2.jpg" alt="Customer" fill className="object-cover" /></div>
                <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white overflow-hidden relative"><Image src="/safari-3.jpg" alt="Customer" fill className="object-cover" /></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#135D66] font-extrabold text-xl leading-none">2,000+</span>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Happy Travelers</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
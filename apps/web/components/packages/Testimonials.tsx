// apps/web/components/packages/Testimonials.tsx
"use client";
import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-[#FDFEFE] border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        
        {/* Left Col: Image */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[500px] h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg">
            {/* Fallback Unsplash image to simulate the happy couple */}
            <Image 
              src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&q=80&w=800" 
              alt="Happy Trekkers" 
              fill 
              unoptimized 
              className="object-cover" 
            />
          </div>
        </div>

        {/* Right Col: Content */}
        <div className="w-full lg:w-1/2">
          <p className="text-[#F51A43] font-bold text-xs uppercase tracking-widest mb-3">What Our Travellers Say</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
            Real Stories From Happy Trekkers
          </h2>
          
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            From the 8-day Lemosho trek on Kilimanjaro to a thrilling 4-day Serengeti safari, every moment was flawlessly organized by this locally-owned company. The team was incredibly responsive, the guides were outstanding, the gear was in excellent condition, and freshly prepared meals made the experience even more memorable. Truly a seamless, safe, and unforgettable adventure.
          </p>

          <div className="mb-8">
            <p className="text-[#F51A43] font-bold text-lg">~ Sarah b</p>
            <p className="text-gray-500 text-sm">Date of experience: February 2024</p>
            <a href="#" className="text-gray-900 font-medium text-sm underline mt-2 inline-block hover:text-[#F51A43] transition-colors">
              Read full testimonial ↗
            </a>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-4">Click any of the below to read more testimonials</p>
            <div className="flex items-center gap-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              {/* Tripadvisor Logo Placeholder */}
              <div className="flex items-center gap-1 font-bold text-lg text-black">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">oo</div>
                tripadvisor
              </div>
              {/* Google Logo Placeholder */}
              <div className="flex items-center gap-1 font-bold text-lg text-gray-800">
                <span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span>
              </div>
              {/* Bookmundi Logo Placeholder */}
              <div className="font-bold text-lg text-teal-500">bookmundi</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
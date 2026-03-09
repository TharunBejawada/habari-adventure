// apps/web/components/SafariSection.tsx
"use client";

import Image from "next/image";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function SafariSection() {
  return (
    <section className="w-full bg-[#135D66] relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-visible z-20">
      

      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row items-start justify-between gap-12 relative z-10">
        
        {/* --- LEFT SIDE: Traveler Image --- */}
        {/* We use negative margins to make the image pop out of the top/bottom boundaries slightly, just like the design */}
        <div className="w-full lg:w-[35%] relative h-[500px] lg:h-auto lg:min-h-[800px] flex justify-center items-end order-2 lg:order-1 mt-12 lg:mt-0">
          <div className="relative w-full h-full max-w-[400px] lg:max-w-none lg:absolute lg:bottom-[-160px] lg:left-0 z-30">
            {/* Note: Save your cutout traveler image as 'safari-traveler.png' */}
            <Image 
              src="/safari-traveler.png" 
              alt="Happy Safari Traveler" 
              fill
              className="object-contain object-bottom drop-shadow-2xl"
              priority={false}
            />
          </div>
        </div>

        {/* --- RIGHT SIDE: Text & Cards --- */}
        <div className="w-full lg:w-[65%] flex flex-col items-start order-1 lg:order-2 relative z-20">
          
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Authentic African Safari Experiences <br className="hidden md:block" />
            <span className="text-[#E59A1D]">Designed Around You</span>
          </h2>

          <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4 max-w-3xl">
            Every traveler’s vision of an African safari is unique. And that’s exactly how we design our journeys. As a trusted tour operator Tanzania, Habari Adventure creates fully customized Tanzania safari tours that balance wildlife encounters, scenic landscapes, and cultural immersion.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full mb-6">
            <div className="space-y-3">
              <span className="text-white font-semibold text-sm uppercase tracking-wider mb-1 block">Whether you want:</span>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#98D80D] mt-0.5">✔</span> A luxury Serengeti safari</li>
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#98D80D] mt-0.5">✔</span> A private wildlife safari Tanzania experience</li>
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#98D80D] mt-0.5">✔</span> A multi-park adventure covering Ngorongoro and Tarangire</li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-white font-semibold text-sm uppercase tracking-wider mb-1 block">We ensure:</span>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#E59A1D] mt-0.5">✔</span> Seamless logistics</li>
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#E59A1D] mt-0.5">✔</span> Expert guiding</li>
                <li className="flex items-start gap-2 text-white/90 text-sm"><span className="text-[#E59A1D] mt-0.5">✔</span> Meaningful moments in Africa’s most iconic destinations</li>
              </ul>
            </div>
          </div>
          
          <p className="text-white/80 text-sm italic mb-12">
            *Our itineraries are crafted around your pace and preferences, perfect for honeymooners seeking intimate lodges or families exploring for the first time.
          </p>

          {/* Destinations Header */}
          <h3 className={`${caveat.className} text-3xl text-white mb-6 tracking-wide`}>
            Explore Tanzania’s Iconic Safari Destinations
          </h3>

          {/* 3 CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {/* Card 1: Serengeti */}
            <div className="bg-white rounded-[30px] rounded-br-none p-6 pt-8 pb-12 relative shadow-xl transform transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 mx-auto mb-4 text-[#3B82F6]">
                {/* Safari Icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
              </div>
              <h4 className="text-[#135D66] font-bold text-center mb-3 text-lg leading-tight">Serengeti<br/>National Park</h4>
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                Home to the legendary safari, the Great Migration, Big Five sightings, and endless golden savannah landscapes.
              </p>
              {/* Folded Corner Effect (Blue) */}
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-[#3B82F6] rounded-tr-[20px] rounded-bl-[30px] flex items-center justify-center text-white font-bold text-sm">
                01
              </div>
            </div>

            {/* Card 2: Ngorongoro */}
            <div className="bg-white rounded-[30px] rounded-br-none p-6 pt-8 pb-12 relative shadow-xl transform transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 mx-auto mb-4 text-[#E59A1D]">
                {/* Crater/Mountain Icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 10l2 2 4-4" /></svg>
              </div>
              <h4 className="text-[#135D66] font-bold text-center mb-3 text-lg leading-tight">Ngorongoro<br/>Crater</h4>
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                "Africa’s Eden." Offers one of the highest densities of wildlife in Africa, including year-round rhino sightings.
              </p>
              {/* Folded Corner Effect (Yellow) */}
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-[#E59A1D] rounded-tr-[20px] rounded-bl-[30px] flex items-center justify-center text-white font-bold text-sm">
                02
              </div>
            </div>

            {/* Card 3: Tarangire */}
            <div className="bg-white rounded-[30px] rounded-br-none p-6 pt-8 pb-12 relative shadow-xl transform transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 mx-auto mb-4 text-[#98D80D]">
                {/* Tree/Nature Icon */}
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h4 className="text-[#135D66] font-bold text-center mb-3 text-lg leading-tight">Tarangire<br/>National Park</h4>
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                A hidden gem famous for giant baobab trees and large elephant herds, perfect for many Tanzania safari tours.
              </p>
              {/* Folded Corner Effect (Green) */}
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-[#98D80D] rounded-tr-[20px] rounded-bl-[30px] flex items-center justify-center text-white font-bold text-sm">
                03
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* --- BOTTOM LEFT MONUMENTS IMAGE --- */}
      {/* Anchored at the traveler’s feet. Using negative bottom and left to create overlap.
          Scale responsive: w-[280px] mobile -> w-[500px] desktop
      */}
      <div className="absolute bottom-[-40px] md:bottom-[-60px] left-0 md:left-[2%] w-[280px] md:w-[400px] lg:w-[500px] z-40 pointer-events-none">
        <Image 
          src="/monuments.png" 
          alt="World Monuments" 
          width={600}
          height={300}
          className="w-full h-auto object-contain drop-shadow-2xl"
        />
      </div>

      {/* --- BOTTOM RIGHT CAPSULE IMAGE --- */}
      {/* This wide pill shape (choose-2.jpg) should use negative bottom values to overlap the next section.
          Overflow-visible on the parent <section> is critical here.
      */}
      {/* <div className="absolute bottom-[-60px] md:bottom-[-100px] lg:bottom-[-130px] right-[-2%] md:right-[2%] w-[95%] sm:w-[500px] lg:w-[800px] h-[100px] sm:h-[160px] lg:h-[220px] z-30 rounded-full overflow-hidden shadow-2xl">
        <Image 
           src="/choose-2.jpg" 
           alt="Tanzania Landscape" 
           fill
           className="object-cover"
         />
      </div> */}

    </section>
  );
}
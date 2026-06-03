// apps/web/components/ClimbingSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocalizedUrl } from "../hooks/useLocalizedUrl";

export default function ClimbingSection() {
  const { getLocalizedUrl } = useLocalizedUrl();
  return (
    <section className="w-full bg-[#F9FAFB] py-10 px-4 sm:px-6 lg:px-8">
    <div className="w-full bg-[#135D66] relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden z-20 rounded-[40px]">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] aspect-square rounded-full bg-white/5 blur-[120px] pointer-events-none z-0"></div>

      {/* --- TOP HEADER SECTION --- */}
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row justify-between items-start relative z-20">
        
        {/* Left Side: Intro Text & CTA */}
        <div className="w-full lg:w-[40%] flex flex-col items-start space-y-6">
          <h2 className="headingCSS text-4xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight">
            <span className="text-[#fe6e00]">Epic Mountain</span><br />
            Trekking Adventures!
          </h2>
          
          <p className="descCSS text-white/80 text-sm md:text-base leading-relaxed max-w-md">
            Conquer Africa’s highest peaks. Our guided climbing experiences are led by certified mountain professionals trained in altitude safety, ethical porter treatment, and emergency response.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Link 
              href={getLocalizedUrl("/climbing/Kilimanjaro")}
              className="bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white font-bold text-sm md:text-base py-3 md:py-4 px-8 rounded-full transition-transform hover:-translate-y-1 shadow-lg shadow-[#fe6e00]/20"
            >
              View Expeditions
            </Link>
            
            {/* Happy Customers Mini-Stat */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-[#135D66] overflow-hidden relative"><Image src="/safari-1.jpg" alt="Climber" fill sizes="32px" className="object-cover" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-[#135D66] overflow-hidden relative"><Image src="/safari-2.jpg" alt="Climber" fill sizes="32px" className="object-cover" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#135D66] overflow-hidden relative"><Image src="/safari-3.jpg" alt="Climber" fill sizes="32px" className="object-cover" /></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[#fe6e00] font-extrabold text-xl leading-none">3,500+</span>
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider mt-1">Summits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Huge Typography */}
        <div className="opacity-30 w-full lg:w-[60%] flex flex-col justify-center items-start lg:items-end mr-24 mt-16 lg:mt-18 relative">
          <div className="!text-[42px] text-[#fe6e00] font-black text-6xl md:text-8xl lg:text-[110px] leading-none tracking-tighter drop-shadow-lg">
            TOP
          </div>
          <div className="!text-[42px] text-white font-black text-5xl md:text-7xl lg:text-[90px] leading-none tracking-tighter drop-shadow-lg">
            EXPEDITIONS
          </div>
        </div>

      </div>

      {/* --- THE ROCK CLIMBER IMAGE --- */}
      {/* Absolute positioned to hang off the top right edge, exactly like the design */}
      <div className="absolute top-0 right-0 w-[200px] md:w-[300px] lg:w-[450px] h-[300px] md:h-[450px] lg:h-[925px] pointer-events-none z-30 hidden sm:block">
        {/* Note: Use a transparent PNG of a rock climber here! */}
        <Image
          src="/climber.png"
          alt="Rock Climber"
          fill
          sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 450px"
          className="object-contain object-right-top drop-shadow-2xl"
        />
      </div>

      {/* --- EXPEDITION CARDS GRID --- */}
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 mt-16 lg:mt-24 relative z-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* CARD 1: Kilimanjaro */}
          <Link href={getLocalizedUrl("/climbing/Kilimanjaro")}>
          <div className="cursor-pointer bg-[#0A484F] rounded-[30px] p-7 border border-white/10 shadow-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-300">
            {/* Image Header */}
            <div className="w-full h-[220px] relative rounded-[20px] overflow-hidden">
              <Image src="/kili-mount.jpg" alt="Mount Kilimanjaro" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A484F] to-transparent opacity-80"></div>
              <div className="absolute bottom-4 left-4">
                <h4 className="headingCSS text-2xl font-bold text-white leading-tight">Kilimanjaro</h4>
                <p className="descCSS text-[#fe6e00] text-xs font-bold tracking-wide uppercase mt-1">5,895m • Africa's Highest Peak</p>
              </div>
            </div>
            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col space-y-6">
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">Popular Routes</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Machame & Lemosho Route</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Marangu & Northern Circuit</li>
                  <li className="descCSS flex items-start gap-2 text-white/70 text-xs italic mt-2">Carefully structured to maximize acclimatization and summit success.</li>
                </ul>
              </div>
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">We Ensure</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> High-quality mountain gear</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Nutritious chef-prepared meals</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Ethical porter treatment</li>
                </ul>
              </div>
            </div>
          </div>
          </Link>

          {/* CARD 2: Mount Meru */}
          <Link href={getLocalizedUrl("/climbing/meru")}>
          <div className="cursor-pointer bg-[#0A484F] rounded-[30px] p-7 border border-white/10 shadow-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-300">
            {/* Image Header */}
            <div className="w-full h-[220px] relative rounded-[20px] overflow-hidden">
              <Image src="/meru-mount.jpg" alt="Mount Meru" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A484F] to-transparent opacity-80"></div>
              <div className="absolute bottom-4 left-4">
                <h4 className="headingCSS text-2xl font-bold text-white leading-tight">Mount Meru</h4>
                <p className="descCSS text-[#fe6e00] text-xs font-bold tracking-wide uppercase mt-1">4,566m • Tanzania’s Hidden Gem</p>
              </div>
            </div>
            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col space-y-6">
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">Why Choose Meru?</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Spectacular crater & sunrise views</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Wildlife encounters during ascent</li>
                  <li className="descCSS flex items-start gap-2 text-white/70 text-xs italic mt-2">Ideal acclimatization and warm-up before a full Kilimanjaro expedition.</li>
                </ul>
              </div>
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">We Provide</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Park-certified guides & rangers</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Quality gear & chef meals</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Combine with Safari tours</li>
                </ul>
              </div>
            </div>
          </div>
          </Link>

          {/* CARD 3: Mount Kenya */}
          <Link href={getLocalizedUrl("/climbing/mount-kenya")}>
          <div className="cursor-pointer bg-[#0A484F] rounded-[30px] p-7 border border-white/10 shadow-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-300">
            {/* Image Header */}
            <div className="w-full h-[220px] relative rounded-[20px] overflow-hidden">
              <Image src="/kenya-mount.jpg" alt="Mount Kenya" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A484F] to-transparent opacity-80"></div>
              <div className="absolute bottom-4 left-4">
                <h4 className="headingCSS text-2xl font-bold text-white leading-tight">Mount Kenya</h4>
                <p className="descCSS text-[#fe6e00] text-xs font-bold tracking-wide uppercase mt-1">5,199m • Africa’s 2nd Highest</p>
              </div>
            </div>
            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col space-y-6">
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">The Experience</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Rugged alpine & glacial scenery</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✔</span> Sirimon, Chogoria & Naro Moru routes</li>
                  <li className="descCSS flex items-start gap-2 text-white/70 text-xs italic mt-2">Technical and non-technical options with fewer crowds for a remote feel.</li>
                </ul>
              </div>
              <div>
                <span className="text-white/50 text-[11px] uppercase tracking-widest font-bold block mb-2.5 border-b border-white/10 pb-1">Combo Packages</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Safari + Alpine Trekking</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Kili + Mt. Kenya Double Summit</li>
                  <li className="flex items-start gap-2 text-white/90 text-sm"><span className="headingCSS text-[#fe6e00] mt-0.5 text-xs">✦</span> Seamless cross-border logistics</li>
                </ul>
              </div>
            </div>
          </div>
          </Link>

        </div>
      </div>
    </div>
    </section>
  );
}
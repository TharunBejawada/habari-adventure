// apps/web/components/Hero.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

interface LinkItem { name: string; url: string; }

// --- CUSTOM ANIMATED NUMBER COMPONENT ---
function AnimatedNumber({ end, duration = 2000, suffix = "+" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // 1. Detect when the number scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // FIX: Added the question mark (entry?.isIntersecting) to satisfy TypeScript
        if (entry?.isIntersecting) {
          setIsVisible(true);
          // Unobserve so it only animates once per page load
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // 2. Run the smooth count-up animation
  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Smooth ease-out effect (starts fast, slows down at the end)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  // toLocaleString() automatically adds the comma to "2,000"
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Helper function to map names to SVG icons (Same as Footer)
const getSocialIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("facebook") || normalized.includes("fb")) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>;
  if (normalized.includes("instagram") || normalized.includes("ig")) return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
  if (normalized.includes("twitter") || normalized.includes("x")) return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
  if (normalized.includes("pinterest") || normalized.includes("pin")) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.981 7.436 6.953 0 4.156-2.617 7.502-6.252 7.502-1.221 0-2.369-.634-2.763-1.383l-.752 2.869c-.272 1.038-1.011 2.339-1.505 3.132 1.157.348 2.388.536 3.654.536 6.623 0 11.985-5.365 11.985-11.987C23.97 5.367 18.633 0 12.017 0z"/></svg>;
  if (normalized.includes("linkedin")) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
};

export default function Hero() {
  const [socialLinks, setSocialLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.socialLinks) {
          setSocialLinks(typeof data.data.socialLinks === 'string' ? JSON.parse(data.data.socialLinks) : data.data.socialLinks);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moveCloud {
            0% { transform: translateX(-15vw); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateX(110vw); opacity: 0; }
          }
          .animate-moveCloud { animation: moveCloud 35s linear infinite; }
          .animate-moveCloud-slow { animation: moveCloud 45s linear infinite; animation-delay: -15s; }
        `
      }} />

      {/* --- HERO SECTION --- */}
      {/* Background pulls underneath the header with -mt-[130px] */}
      <section className="relative w-full bg-[#135D66] overflow-hidden pt-[160px] lg:pt-[190px] pb-32 lg:pb-40 z-0 -mt-[130px] rounded-b-[40px] shadow-2xl">
        
        {/* Animated Clouds */}
        <div className="absolute top-[180px] w-full z-10 pointer-events-none opacity-80">
            <div className="inline-block whitespace-nowrap animate-moveCloud">
                <img src="/Cloud1.png" alt="Cloud" width="168" height="131" loading="lazy" />
            </div>
        </div>
        <div className="absolute top-20 w-full z-10 pointer-events-none opacity-80">
            <div className="inline-block whitespace-nowrap animate-moveCloud-slow">
                <img src="/Cloud2.png" alt="Cloud" width="168" height="131" loading="lazy" />  
            </div>
        </div>

        {/* Decorative Background Image (Fits perfectly without stretching using object-cover) */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/slider-bg.jpg" 
            alt="Mountains Background" 
            fill 
            className="object-cover object-top w-full h-full opacity-60 mix-blend-overlay"
            priority
          />
        </div>

        {/* Main Hero Content */}
        <div className="max-w-[1400px] mx-auto w-[96%] relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* LEFT SIDE: Text & Actions */}
          <div className="w-full lg:w-[50%] flex flex-col items-start relative z-30">
            
            <h2 className={`${caveat.className} text-white text-4xl md:text-5xl lg:text-6xl mb-2 tracking-wide`}>
              Tanzania Safari Tours
            </h2>
            <h1 className={`${caveat.className} text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 drop-shadow-lg`}>
              & Kilimanjaro Climbing Adventures
            </h1>

            <p className="text-white text-lg md:text-xl font-semibold tracking-wide mb-3">
              Experience authentic African safari adventures with trusted Tanzania experts.
            </p>

            <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-2xl mb-8">
              Explore Serengeti wildlife and conquer Kilimanjaro with expertly guided Tanzania safari and climbing adventures designed for unforgettable journeys. Whether you're planning your first wildlife safari Tanzania or preparing for a life-changing Kilimanjaro climbing expedition, we ensure every detail is seamless.
            </p>

            <Link href="/contact" className="bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-bold text-lg py-4 px-10 rounded-full transition-transform hover:scale-105 shadow-lg shadow-[#98D80D]/20">
              Start Your Adventure
            </Link>

            {/* Trip Category Finder (Stacks on mobile, inline on desktop) */}
            <div className="mt-12 bg-white rounded-3xl md:rounded-full p-4 md:p-3 w-full max-w-3xl flex flex-col md:flex-row items-center gap-4 md:gap-2 shadow-2xl">
              <div className="flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0">
                <label className="block text-xs font-bold text-[#135D66] uppercase tracking-wider mb-1">Category</label>
                <select className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer appearance-none">
                  <option>Safari</option>
                  <option>Climbing</option>
                  <option>Zanzibar & Leisure</option>
                </select>
              </div>

              <div className="flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0">
                <label className="block text-xs font-bold text-[#135D66] uppercase tracking-wider mb-1">Date</label>
                <input type="date" className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer" />
              </div>

              <div className="flex-1 w-full px-4 pb-3 md:pb-0">
                <label className="block text-xs font-bold text-[#135D66] uppercase tracking-wider mb-1">Travelers</label>
                <input type="number" min="1" placeholder="2 Adults" className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none" />
              </div>

              <button className="w-full md:w-14 h-12 md:h-14 mt-2 md:mt-0 bg-[#98D80D] hover:bg-[#86C00B] rounded-full flex items-center justify-center transition-colors shrink-0 text-[#135D66]">
                <span className="md:hidden font-bold mr-2">Search</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            {/* Dynamic Social Follow */}
            <div className="flex items-center gap-6 mt-10">
              <span className="text-white text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-4">
                Follow Us <span className="w-12 h-[1px] bg-white/50 block"></span>
              </span>
              <div className="flex flex-wrap gap-4 text-white">
                {socialLinks.map((social: LinkItem, idx: number) => (
                  <a key={idx} href={social.url} target="_blank" rel="noreferrer" title={social.name} className="hover:text-[#98D80D] transition-colors">
                    {getSocialIcon(social.name)}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Plane and Traveler Images */}
          <div className="w-full lg:w-[50%] min-h-[400px] lg:min-h-0 relative z-20 mt-16 lg:mt-0">
            <div className="relative w-full h-full flex justify-end items-end">
              
              {/* Airplane Line - Fixed to Top Right */}
              <div className="absolute top-[-80px] md:top-[-100px] right-0 w-[80%] md:w-[60%] lg:w-[120%] xl:w-[100%] pointer-events-none z-10">
                  <img src="/Plane-With-Line.png" alt="Airplane" loading="lazy" className="w-full h-auto drop-shadow-lg animate-pulse" />
              </div>
              
              {/* Traveler Image */}
              <div className="relative z-20 w-full sm:w-3/4 lg:w-[90%] xl:w-[85%] ml-auto">
                  <img src="/right-pic.png" alt="Happy Traveler" loading="lazy" className="w-full h-auto drop-shadow-2xl" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- STATS / TRUST BAR --- */}
      <div className="relative z-30 max-w-[1200px] mx-auto w-[96%] -mt-16 bg-[#0E4950] rounded-2xl shadow-2xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/20 p-8 md:p-10">
          
          <div className="flex items-center justify-center gap-6 py-4 md:py-0">
            <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <p className="text-white text-lg font-medium tracking-wide">Happy Travelers</p>
              {/* REPLACED STATIC TEXT WITH ANIMATED COUNTER */}
              <h3 className="text-[#E59A1D] text-4xl font-black mt-1">
                <AnimatedNumber end={2000} />
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 py-4 md:py-0">
            <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <div>
              <p className="text-white text-lg font-medium tracking-wide">Years of Safari Expertise</p>
              {/* REPLACED STATIC TEXT WITH ANIMATED COUNTER */}
              <h3 className="text-[#E59A1D] text-4xl font-black mt-1">
                <AnimatedNumber end={13} />
              </h3>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
// apps/web/app/crew/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";
import { apiFetch } from "../../../lib/apiClient";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function OurCrewPage() {
  const [crewData, setCrewData] = useState<{ settings: any; teams: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  // --- 1. FETCH DATA ---
  useEffect(() => {
    apiFetch("/crew")
      .then((result) => {
        if (result.ok && result.data) {
          setCrewData(result.data);
          if (Array.isArray(result.data?.teams) && result.data.teams.length > 0) {
            setActiveSection(result.data.teams[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch crew data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // --- 2. SCROLL ANIMATION OBSERVER ---
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, crewData]);

  // --- 3. SCROLLSPY FOR STICKY SIDEBAR ---
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll("div[data-team-section]");
      let currentSection = activeSection;
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        // Offset by 200px to trigger slightly before the section hits the exact top
        if (window.scrollY >= sectionTop - 250) {
          currentSection = section.getAttribute("id") || "";
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, activeSection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#fe6e00] rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  const { settings, teams } = crewData || { settings: {}, teams: [] };

  return (
    <div className="bg-[#FDFEFE] min-h-screen font-sans text-gray-800 scroll-smooth">
      
      {/* --- INJECTED CSS FOR SCROLL REVEALS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll { 
          opacity: 0; 
          transform: translateY(40px); 
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .reveal-on-scroll.is-visible { 
          opacity: 1; 
          transform: translateY(0); 
        }
      `}} />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full h-[55vh] min-h-[450px] flex flex-col justify-center -mt-[150px] pt-[120px] overflow-hidden bg-[#0a0f16]">
        {settings?.heroBannerImage ? (
          <Image
            src={settings.heroBannerImage}
            alt="Our Crew"
            fill
            sizes="100vw"
            unoptimized
            className="object-cover object-top opacity-60 transition-transform duration-[10s] ease-out hover:scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-[#135D66]" />
        )}
        
        {/* <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/40 to-transparent opacity-90" /> */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center reveal-on-scroll is-visible">
          <span className={`${caveat.className} text-[#E59A1D] text-3xl md:text-4xl mb-2 block tracking-wide`}>
            Meet the Experts
          </span>
          <h1 className="text-white text-5xl md:text-7xl font-extrabold uppercase tracking-tight mb-6 drop-shadow-xl">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Crew</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            The heart and soul of Habari Adventure. Our passionate guides, chefs, and porters are dedicated to making your journey safe, successful, and unforgettable.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. MAIN CONTENT (SIDEBAR + GRID)           */}
      {/* ========================================== */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* --- LEFT SIDEBAR: STICKY NAVIGATION --- */}
          <div className="w-full lg:w-1/4 hidden lg:block shrink-0">
            <div className="sticky top-32">
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6 pb-4 border-b border-gray-200">
                Our Departments
              </h4>
              <ul className="space-y-2 relative">
                {/* Visual Line Indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 rounded-full"></div>

                {teams?.map((team) => (
                  <li key={`nav-${team.id}`} className="relative">
                    <button
                      onClick={() => scrollToSection(team.id)}
                      className={`text-sm font-bold transition-all w-full text-left py-3 pl-6 relative ${
                        activeSection === team.id 
                          ? "text-[#135D66]" 
                          : "text-gray-400 hover:text-gray-800"
                      }`}
                    >
                      {/* Active Dot Indicator */}
                      {activeSection === team.id && (
                        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#E59A1D] rounded-full border-2 border-white shadow-sm z-10"></div>
                      )}
                      {team.name}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Contact Prompt below Nav */}
              <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100"><h5 className="font-bold text-gray-900 mb-2">Have Questions?</h5><p className="text-sm text-gray-600 mb-4">Our team is ready to help clarify.</p><a className="text-sm font-bold text-white bg-[#111827] hover:bg-black py-2.5 px-6 rounded-full block text-center transition-colors" href="/contact">Contact Support</a></div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: TEAMS & MEMBERS --- */}
          <div className="w-full lg:w-3/4">
            {teams?.map((team) => (
              <div 
                key={team.id} 
                id={team.id} 
                data-team-section 
                className="mb-24 last:mb-0 scroll-mt-32"
              >
                
                {/* Team Header - Animated */}
                <div className="reveal-on-scroll mb-12 border-b border-gray-200 pb-6 flex flex-col items-start">
                  <h2 className="text-4xl font-extrabold text-[#135D66] uppercase tracking-tight">
                    {team.name}
                  </h2>
                  <div className="w-20 h-1 bg-[#E59A1D] mt-4 rounded-full"></div>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                  {team.members?.map((member: any, index: number) => (
                    <div 
                      key={member.id} 
                      className="reveal-on-scroll group flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                      style={{ transitionDelay: `${index * 100}ms` }} // Staggered reveal effect
                    >
                      
                      {/* Premium Vertical Image Container */}
                      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
                        <Image 
                          src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=135D66&color=fff`} 
                          alt={member.name} 
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                          className="object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                        />
                        {/* Gradient overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        
                        {/* Name inside the image for a sleeker look */}
                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-xs font-bold text-[#E59A1D] uppercase tracking-wider mb-1 drop-shadow-md">
                            {member.designation}
                          </p>
                          <h3 className="text-2xl font-extrabold text-white drop-shadow-md">
                            {member.name}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Member Bio Content */}
                      <div className="p-6 md:p-8 flex flex-col flex-grow bg-white">
                        <div 
                          className="text-gray-600 text-sm leading-relaxed flex-grow whitespace-normal [&>p]:mb-3 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4" 
                          dangerouslySetInnerHTML={{ __html: (member.description || "").replace(/&nbsp;/g, ' ') }}
                        ></div>
                      </div>

                    </div>
                  ))}
                </div>

                {team.members?.length === 0 && (
                  <div className="reveal-on-scroll bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center">
                    <p className="text-gray-400 italic">No members listed in this team yet.</p>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 3. PORTER SECTION (PARALLAX BANNER)        */}
      {/* ========================================== */}
      {settings?.porterBannerImage && (
        <section className="relative w-full py-32 md:py-40 mt-10 overflow-hidden reveal-on-scroll">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={settings.porterBannerImage} 
              alt="Our Porters" 
              fill
              sizes="100vw"
              unoptimized
              className="object-cover transform scale-105" 
            />
            {/* Premium Dark Overlay */}
            <div className="absolute inset-0 bg-[#0a0f16]/40 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 text-center p-8 md:p-16 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tight mb-4 drop-shadow-lg">
              The Backbone of <span className={`${caveat.className} text-[#E59A1D] font-normal tracking-normal`}>Habari</span>
            </h2>
            <div className="w-24 h-1 bg-[#135D66] mx-auto rounded-full mb-10 shadow-lg"></div>
            
            <div 
              className="text-gray-100 text-base md:text-lg font-medium leading-relaxed md:leading-loose whitespace-normal [&>p]:mb-6 last:[&>p]:mb-0 drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: (settings.porterDescription || "").replace(/&nbsp;/g, ' ') }}
            ></div>
          </div>
        </section>
      )}

    </div>
  );
}
// apps/web/app/sustainability/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ==========================================
// SMOOTH NUMBER COUNTER ANIMATION HOOK
// ==========================================
function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          let startTimestamp: number;
          const duration = 2000; // 2 seconds duration

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart easing function for a smooth slow-down at the end
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeProgress * value));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          
          window.requestAnimationFrame(step);
          if (counterRef.current) observer.unobserve(counterRef.current);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return <span ref={counterRef}>{count}{suffix}</span>;
}

export default function SustainabilityPage() {
  const [activeSection, setActiveSection] = useState("overview");

  // --- SCROLL ANIMATION OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // --- SCROLLSPY FOR STICKY SIDEBAR ---
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("div[id]");
      let currentSection = "overview";
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          currentSection = section.getAttribute("id") || "overview";
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* SEO TAGS */}
      <title>Sustainability | Habari Adventure</title>
      <meta name="description" content="Discover how Habari Adventure supports local communities, fights against Malaria, aids orphanages, and champions environmental conservation in Tanzania." />

      {/* --- INJECTED CSS FOR SCROLL REVEALS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
      `}} />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full h-[55vh] min-h-[450px] flex flex-col justify-center -mt-[150px] pt-[120px] overflow-hidden bg-[#0a0f16]">
        <div className="absolute inset-0 z-0">
          {/* You can replace this Unsplash URL with a specific image from your public folder later (e.g., "/sustainability-hero.jpg") */}
          <Image 
            src="/sustainability.webp" 
            alt="Sustainability and Community" 
            fill 
            unoptimized
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center reveal-on-scroll is-visible">
          <span className="font-caveat text-[#fe6e00] font-bold text-5xl tracking-normal mb-4 block">
            Making an Impact
          </span>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4 drop-shadow-lg">
            Sustainability
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-6">
            Supporting local communities and ensuring a sustainable future while providing amazing tours.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. MAIN CONTENT WITH STICKY SIDEBAR        */}
      {/* ========================================== */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Col: Sticky Table of Contents */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <div className="sticky top-32 space-y-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6 pb-4 border-b border-gray-200">
                Contents
              </h4>
              <ul className="space-y-3">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "malaria", label: "Fight against Malaria" },
                  { id: "orphanage", label: "Support Orphanage" },
                  { id: "conservation", label: "Environmental Conservation" },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`text-sm font-medium transition-all w-full text-left py-2 ${
                        activeSection === item.id 
                          ? "text-[#fe6e00] font-bold border-l-2 border-[#fe6e00] pl-4" 
                          : "text-gray-500 hover:text-gray-900 pl-4 border-l-2 border-transparent"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Quick CTA in sidebar */}
              <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h5 className="font-bold text-gray-900 mb-2">Get Involved</h5>
                <p className="text-sm text-gray-600 mb-4">Want to volunteer or donate during your trip?</p>
                <Link href="/contact" className="text-sm font-bold text-white bg-[#111827] hover:bg-black py-2.5 px-6 rounded-full block text-center transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Right Col: Editorial Content */}
          <div className="w-full lg:w-3/4 space-y-20">
            
            {/* Overview */}
            <div id="overview" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Overview</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Habari Adventure are focused on providing amazing tours to our clients, however we also support local community projects in order to ensure a sustainable future. We are grateful to our clients who have supported our community projects either indirectly simply by booking with us or directly by being involved in visiting or supporting some of the organisations that take care of individual needs like orphanage and other special groups.
                </p>
                <p>
                  We welcome you in discovering more about the local community that you travel through.
                </p>
              </div>
            </div>

            {/* Fight against Malaria */}
            <div id="malaria" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Fight against Malaria</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Malaria is an infectious disease caused by a parasite, it is spread by the bite of an infected Mosquito. People catch malaria when the parasite enters the blood. The parasite causes a deadly infection which kills many people each year.
                </p>
                <p>
                  In 2016, there were 216 million malaria cases that led to 440,000 deaths. Of these about two thirds (290,000) were children under five years of age. This translates into a daily toll of nearly 800 children under age 5. Most of these deaths occurred in sub-Saharan Africa. Since 2010, mortality rates among children under five have fallen by 34 per cent due to education and the use of Mosquito nets.
                </p>
                
                <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-[#135D66]/20 my-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#135D66] rounded-full flex items-center justify-center shrink-0 text-white">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900 mb-2">
                      <AnimatedCounter value={500} suffix="+" /> Nets Donated Annually
                    </h4>
                    <p className="text-gray-600 text-base leading-relaxed mb-0">
                      Habari Adventure donates more than 500 Mosquito nets every year into our community in the Kilimanjaro region in order to meet our mission of giving back. We educate as much as we can about the prevention of this disease.
                    </p>
                  </div>
                </div>

                <p>
                  In addition, we welcome our clients to visit and donate mosquito nets in order to continue fighting against Malaria.
                </p>
              </div>
            </div>

            {/* Support Orphanage */}
            <div id="orphanage" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Support Orphanage</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Do you have passion for children? Volunteer in Tanzania in the Orphanage project and give much love, care and attention to orphaned children! Poverty, lack of education, and the HIV/AIDS epidemic are persistent and widespread problems for Tanzanians. With very little help from the government, many children are left homeless, and they only have orphanages to turn to. The orphanages are doing their best to educate, clothe, house and feed the children, but they are also underfunded and lack enough manpower to properly care for the orphans.
                </p>
                <p>
                  Habari Adventure supports orphanage organizations in Moshi and is looking for volunteers who wish to support the dreams of these kids. At the end of trips, if you have extra time in Tanzania, you can visit some of these organizations and provide more care and attention to them.
                </p>
                <blockquote className="border-l-4 border-[#fe6e00] pl-6 italic text-gray-800 font-medium my-8 text-xl">
                  "Be a guiding light for the Tanzanian children, while discovering the wonderful wildlife and the majesty of Kilimanjaro!"
                </blockquote>
                <p>
                  For more information on how you can support and volunteer, you can contact us to learn more.
                </p>
              </div>
            </div>

            {/* Environmental Conservation */}
            <div id="conservation" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Environmental Conservation</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Environmental conservation is the protection, preservation, management, or restoration of natural environments and the ecological communities that inhabit them. Conservation is generally held to include the management of human use of natural resources for current public benefit and sustainable social and economic utilization.
                </p>
                <p>
                  Environmental Conservation volunteer programs match participants with local organizations that support biodiversity and the preservation of natural resources. These projects can include both hands-on conservation work and community outreach. Volunteers working on environmental conservation projects plant trees with local community members to prevent erosion, support community recycling efforts, and assist with research projects that aim to protect and preserve the local environment.
                </p>
                
                {/* Stats Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-[#F0F9FA] p-6 rounded-2xl border border-[#135D66]/10 text-center">
                    <span className="block text-4xl font-extrabold text-[#135D66] mb-2">
                      <AnimatedCounter value={2000} suffix="+" />
                    </span>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Trees Planted</span>
                  </div>
                  <div className="bg-[#fff6ef] p-6 rounded-2xl border border-[#fe6e00]/10 text-center">
                    <span className="block text-4xl font-extrabold text-[#fe6e00] mb-2">
                      $<AnimatedCounter value={5} suffix="" />
                    </span>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Cost Per Tree</span>
                  </div>
                </div>

                <p>
                  Habari Adventure has been actively involved in planting trees throughout the Kilimanjaro Area. We also educate and inspire youth to become active in conservation efforts to sustain forest management. As a result, over the last 2 years we have helped to plant over 2000 trees in the Kilimanjaro region.
                </p>
                <div className="bg-gray-900 text-white p-8 rounded-2xl my-8 flex items-start gap-6 shadow-xl">
                  <div className="w-12 h-12 bg-[#fe6e00] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Join Our Tree Planting Initiative</h4>
                    <p className="text-gray-300 text-base leading-relaxed mb-0">
                      For clients who are interested in this project, we take them into our conservation area in a local village before or after their trip to plant traditional trees. This activity is accompanied by a cultural tour, allowing you to learn more about the local people's lifestyles and activities.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
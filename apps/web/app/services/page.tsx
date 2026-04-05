// apps/web/app/services/page.tsx
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

export default function OurServicesPage() {
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
      <title>Our Services | Habari Adventure</title>
      <meta name="description" content="Explore the wide range of services offered by Habari Adventure. From Kilimanjaro climbs and Tanzania safaris to cultural tours and day trips, we’ve got your adventure covered." />

      {/* --- INJECTED CSS FOR SCROLL REVEALS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-on-scroll { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
      `}} />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full h-[55vh] min-h-[450px] flex flex-col justify-center -mt-[120px] pt-[120px] overflow-hidden bg-[#0a0f16]">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1920" 
            alt="Our Services" 
            fill 
            unoptimized
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center reveal-on-scroll is-visible">
          <span className="text-[#F51A43] font-bold text-sm uppercase tracking-widest mb-4 block">
            Excellence in Adventure
          </span>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4 drop-shadow-lg">
            Our Services
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-6">
            Unrivaled levels of expertise, safety, and comfort on Mount Kilimanjaro and across the Tanzanian wilderness.
          </p>
          
          {/* CAVEAT / DISCLAIMER */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full mt-4">
            <svg className="w-4 h-4 text-[#F51A43]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-gray-300 font-medium">
              Note: All itineraries are fully customizable to meet your specific travel needs.
            </p>
          </div>
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
                  { id: "accommodation", label: "Accommodation" },
                  { id: "meals", label: "Meals on the Mountain" },
                  { id: "safety", label: "Safety & Awareness" },
                  { id: "altitude", label: "Altitude Effect" },
                  { id: "health", label: "Health Checks & Medication" },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`text-sm font-medium transition-all w-full text-left py-2 ${
                        activeSection === item.id 
                          ? "text-[#F51A43] font-bold border-l-2 border-[#F51A43] pl-4" 
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
                <h5 className="font-bold text-gray-900 mb-2">Ready to climb?</h5>
                <p className="text-sm text-gray-600 mb-4">Let our experts craft your perfect itinerary.</p>
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
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Overview</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Habari adventure is the finest leading local tour operator based in Kilimanjaro Tanzania. Over years of experience Habari adventure has a proven expertise on Mount Kilimanjaro and wildlife safari. Whether you are a seasoned adventurer or a first-time hiker, our well-trained guides are committed to helping you achieve your goals and create an unforgettable experience during your climb.
                </p>
                
                {/* Highlight Stats Block with Animated Counters */}
                <div className="bg-[#F9FAFB] p-8 rounded-2xl border border-gray-100 my-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <span className="block text-4xl font-extrabold text-[#F51A43] mb-2">
                      <AnimatedCounter value={98} suffix="%" />
                    </span>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Summit Success</span>
                  </div>
                  <div className="text-center md:border-l md:border-r border-gray-200">
                    <span className="block text-4xl font-extrabold text-gray-900 mb-2">
                      <AnimatedCounter value={120} suffix="+" />
                    </span>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Yearly Expeditions</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-4xl font-extrabold text-gray-900 mb-2">
                      <AnimatedCounter value={900} suffix="+" />
                    </span>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Annual Climbers</span>
                  </div>
                </div>

                <p>
                  We are renowned for having the best guides and experts of Kilimanjaro and Safari. Our local presence is exactly what makes it possible for Habari Adventure to give accurate, competent and up-to-date travel advice to our clients and ensure the highest comfort and safety standards in our expedition. We are a fully licensed operator, which actually organizes and runs its own trips.
                </p>
                <blockquote className="border-l-4 border-[#F51A43] pl-6 italic text-gray-800 font-medium my-8 text-xl">
                  "Journey is the destination and Habari Adventure never lose to fulfill the expectation of the specific destination you desire" <br/>
                  <span className="text-sm font-bold text-[#F51A43] not-italic mt-2 block">— Stan Wilfred, C.E.O</span>
                </blockquote>
              </div>
            </div>

            {/* Accommodation */}
            <div id="accommodation" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Accommodation</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Hotels before and after trip accommodation options range from <strong>3 to 5-star hotels</strong> depending on your budget and preferences. Our climbs include overnight accommodations in Moshi on the day preceding and the day following the climb. Therefore, if you arrive the day before the climb begins and leave the day after the climb ends, you will not need to book any extra hotel rooms since amount paid for Kilimanjaro includes it.
                </p>
                <p>
                  Safari accommodation depends on your safari budget list between the Luxury, Midrange or Camping Safari. In Luxury safari based on staying at Tarangire SAFARI Lodge, Serengeti Serena Lodge, Elewana camps and Semetu lodge in the Serengeti. In Ngorongoro clients stay at Lions paw and Ngorongoro Serena lodge. In the same way, midrange Safari can offer camping options from the most basic and adventurous to luxury tented camps.
                </p>
                <div className="bg-gray-900 text-white p-8 rounded-2xl my-8 flex items-start gap-6 shadow-xl">
                  <div className="w-12 h-12 bg-[#F51A43] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Mountain Tents</h4>
                    <p className="text-gray-300 text-base leading-relaxed">
                      On the mountain will be provided an excellent equipment for the Kilimanjaro Adventure with high quality branded. For our trips we are normally using <strong>Mountain hardware and Rei mountain tents</strong>. You will Sleep in the best tents with a nice form mattress and have dinner on mess tents with tables and chairs inside.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div id="meals" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Meals on the Mountain</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Supplying your body with continuous calories is an important factor in successfully climbing Kilimanjaro. A hiker on Kilimanjaro can burn <strong>5,000 to 8,000 calories a day</strong> in order to keep well fueled you have to eat. Therefore, our Habari adventure mountain chefs are brilliant at what they do always get countless compliments for their ability to create delicious restaurant-like meals in mountain conditions.
                </p>
                <p>
                  When people think about backpacking and camping, the food that comes to mind usually involves unappetizing dehydrated food packages and unhealthy powdered mixes. Most Kilimanjaro operators do not serve hot lunches to their clients. Up here, you eat real food and lots of it. We provide clean water collected from mountain streams and treated with Aqua tabs water purification tablets.
                </p>
                <p className="bg-red-50 text-red-900 p-6 rounded-xl border border-red-100 font-medium">
                  <strong>Dietary Requirements:</strong> Note that we can accommodate gluten, lactose free, vegetarian and vegan diets. Maximum comfort in the wild is what we want our Kilimanjaro adventures to be, and we can't resist indulging you when it comes to food.
                </p>
              </div>
            </div>

            {/* Safety */}
            <div id="safety" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Safety & Awareness</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Climbing Kilimanjaro is probably one of the most dangerous things you will ever do. Every year, innumerable people are evacuated from the mountain. When selecting an operator, your safety should take precedence over any other consideration. Beware of companies that downplay the potential dangers of high-altitude trekking.
                </p>
                <p>
                  All outdoor activities carry some degree of risk. Our guides are highly experienced in preventing, detecting, and treating altitude sickness because they handle over 1,000 climbers per year. Also they are certified <strong>Wilderness First Responders (WFR)</strong>, which means they have the tools to make critical medical and evacuation decisions.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                  <li className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <svg className="w-6 h-6 text-[#F51A43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-gray-800">WFR Certified Guides</span>
                  </li>
                  <li className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <svg className="w-6 h-6 text-[#F51A43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-gray-800">Emergency Oxygen Cylinders</span>
                  </li>
                  <li className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <svg className="w-6 h-6 text-[#F51A43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-gray-800">Comprehensive First Aid Kits</span>
                  </li>
                  <li className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <svg className="w-6 h-6 text-[#F51A43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-medium text-gray-800">Evacuation Protocols</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Altitude Effect */}
            <div id="altitude" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Altitude Effect</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  At high altitude the air pressure is lower and thus there are less gases overall. If you are climbing Kilimanjaro, you should be aware of a condition called <strong>Acute Mountain Sickness, or AMS</strong>.
                </p>
                <p>
                  The main cause of altitude sickness is going too high altitude too quickly. Given enough time, your body will adapt to the decrease in oxygen at a specific altitude. This process is known as acclimatization and generally takes one to three days at any given altitude. Another important consideration is route selection. Many climbers fail to reach the summit due to altitude sickness, often because they choose a route that is too short and does not allow their bodies to acclimatize.
                </p>
              </div>
            </div>

            {/* Health & Medication */}
            <div id="health" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Health Checks & Medication</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Before the climb, you will fill out a medical clearance form for the crew to assess your general physical condition. Twice daily, in the morning and evening, our guides will conduct health checks using a pulse oximeter, to measure oxygen saturation in your blood and your pulse rate.
                </p>
                <p>
                  On Kilimanjaro, oxygen saturation percentages are regularly in the 80's. However, when oxygen saturation drops below 80%, we monitor that climber very closely. It is important that you be open, active and honest when answering these questions and with your guide overall.
                </p>
                <h4 className="text-xl font-bold text-[#F51A43] mt-8 mb-4">Regarding Diamox</h4>
                <p>
                  Many climbers turn to Diamox, a prescription drug that helps prevent or lessen the effects of high altitude on the body. Diamox is the brand name for the generic drug acetazolamide. At Habari Adventure, we understand the importance of safety when climbing Kilimanjaro. Trust in our knowledge and experience, and you'll be sure to reach the summit in the safest and most satisfying way possible.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
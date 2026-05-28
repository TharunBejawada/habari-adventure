"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { Caveat } from "next/font/google";
import { apiFetch } from "../../../lib/apiClient";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

// Helper component for counting animation
const AnimatedCounter = ({ target, duration = 2000 }: { target: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Run animation only once
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutExpo easing function for a smooth slow-down at the end
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(target * easeOut));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isVisible]);

  return <span ref={countRef}>{count}</span>;
};

export default function AboutUsPage() {
  const [featuredCrew, setFeaturedCrew] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]); // NEW: State for dynamic stats

  // Fetch the first 4 members of the first team for the featured section
  useEffect(() => {
    apiFetch("/crew")
      .then((result) => {
        if (result.ok && Array.isArray(result.data?.teams) && result.data.teams.length > 0) {
          const firstTeam = result.data.teams[0];
          setFeaturedCrew(Array.isArray(firstTeam?.members) ? firstTeam.members.slice(0, 4) : []);
        }
      })
      .catch((err) => console.error("Failed to fetch crew data:", err));
  }, []);

  // NEW: Fetch dynamic stats for the About page
  useEffect(() => {
    apiFetch("/stats?page=About")
      .then(res => {
        if (res.ok && Array.isArray(res.data)) {
          setStats(res.data);
        }
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  // Collection of the original icons to map dynamically
  const statIcons = [
    <svg className="w-8 h-8 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    <svg className="w-8 h-8 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    <svg className="w-8 h-8 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  ];

  return (
    <div className="bg-[#FDFEFE] min-h-screen font-sans text-gray-800">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden -mt-[150px] z-0">
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
            .animate-fade-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            .animate-fade-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            @keyframes moveCloudContact { 0% { transform: translateX(-20vw); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateX(110vw); opacity: 0; } }
            .animate-cloud-horizontal { animation: moveCloudContact 40s linear infinite; }
            @keyframes movePlaneDiag { 0% { transform: translate(-20vw, -5vh) rotate(15deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(110vw, 15vh) rotate(15deg); opacity: 0; } }
            .animate-plane-diagonal { animation: movePlaneDiag 25s linear infinite; }
            @keyframes floatUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
            @keyframes floatDown { 0%, 100% { transform: translateY(-30px); } 50% { transform: translateY(0); } }
            .animate-balloon-1 { animation: floatUp 6s ease-in-out infinite; }
            .animate-balloon-2 { animation: floatDown 7s ease-in-out infinite; }
          `
        }} />

        <div className="absolute inset-0 z-0">
          <Image src="/about-us.png" alt="Mountains Background" fill sizes="100vw" className="object-cover object-bottom opacity-90" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="max-w-[1000px] mx-auto w-[96%] z-20 flex flex-col items-center text-center px-4">
          <h1 className="headingCSS animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-[0.85em]">Discover</span>{' '}
            <span className={`${caveat.className} text-[#fe6e00] font-normal text-[1.1em]`}>
              Our Story
            </span>
          </h1>
          <p className="descCSS animate-fade-left font-medium text-gray-200 text-sm md:text-base leading-relaxed max-w-3xl mb-12 drop-shadow-md" style={{ animationDelay: '0.3s' }}>
            Learn about our mission, our deep passion for Tanzania, and the dedicated, locally-owned team that makes your ultimate adventure possible.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. ABOUT US (RESTRUCTURED LAYOUT)          */}
      {/* ========================================== */}
      <section className="py-20 xl:py-32 bg-white overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 items-start">
            
            {/* --- LEFT: TITLE & OVERLAPPING IMAGES --- */}
            <div className="w-full lg:w-1/2">
              
              {/* Title Section (Now on the left, above images) */}
              <div className="mb-12 lg:pr-8">
                <span className={`${caveat.className} text-[#fe6e00] text-3xl block mb-2`}>
                  About Our Company
                </span>
                <h2 className="headingCSS text-4xl md:text-5xl font-extrabold text-[#135D66] leading-tight uppercase">
                  We are Habari Adventure Touring Support Company.
                </h2>
              </div>

              {/* Images Wrapper */}
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative z-10 max-w-[80%] before:absolute sm:before:w-[400px] sm:before:h-[400px] before:w-[300px] before:h-[300px] before:-left-12 before:-top-6 before:bg-[#F0F9FA] before:rounded-full before:-z-10">
                  <div className="rounded-[40px] overflow-hidden shadow-2xl">
                    <Image 
                      src="/about-main.png" 
                      alt="Habari Adventure Trekking" 
                      width={500} 
                      height={700} 
                      unoptimized
                      className="w-full object-contain aspect-[3/4]"
                    />
                  </div>
                </div>
                
                {/* Overlapping Secondary Image */}
                <div className="absolute z-20 xl:-right-4 md:-right-0 -right-4 bottom-12 w-[55%] border-[12px] border-white rounded-[40px] shadow-2xl overflow-hidden hidden sm:block">
                  <Image 
                    src="/about-secondary.jpg" 
                    alt="Tanzania Safari" 
                    width={350} 
                    height={350} 
                    unoptimized
                    className="w-full object-cover aspect-square"
                  />
                </div>

                {/* Floating Experience Badge */}
                <div className="absolute z-30 bottom-0 left-8 sm:-bottom-8 sm:left-1/2 sm:-translate-x-1/2 bg-white px-8 py-6 rounded-3xl shadow-[0px_20px_40px_rgba(19,93,102,0.15)] flex items-center gap-4 border border-gray-50">
                  <h2 className="font-extrabold text-5xl md:text-6xl text-[#fe6e00] drop-shadow-sm">13+</h2>
                  <span className="text-gray-800 font-bold text-lg leading-tight uppercase tracking-wide">Years of <br/>Experience</span>
                </div>
              </div>
            </div>

            {/* --- RIGHT: CONTENT (PARAGRAPHS & QUOTE) --- */}
            <div className="w-full lg:w-1/2 lg:pt-4">
              <div className="descCSS mb-10">
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Established in 2012 as a locally-owned company by Stan Wilfred. He started this company at the age of 18 while in college and worked as a porter for 2 years as he pursued his passion for the outdoors, travel, and entrepreneurship.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Today, Habari Adventure is rated as one of the leading tour operators in Tanzania, receiving hundreds of visitors a year—but our motivation is exactly the same: to treat all visitors as our personal guests and change lives by introducing tourists to the continent that brought them happiness.
                </p>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Our dedicated team of professionals has one goal, to provide the best and most memorable adventure experience for you. Habari Adventure takes the utmost care in arranging your tours and ensuring everything goes as planned. We pride ourselves in changing a large number of lives by introducing tourists to the continent that brought them happiness, learnings and priceless memories.
                </p>

                <p className="text-gray-600 text-lg leading-relaxed mb-10">
                  Whether you're looking for something luxurious or something on a tight budget, Habari Adventures has something in the marketplace for you. With Habari Adventures his dream came true.
                </p>

                {/* Highlight Quote Box */}
                <div className="bg-[#F0F9FA] p-6 md:p-8 rounded-r-3xl shadow-sm">
                  <h4 className="headingCSS font-extrabold text-[#135D66] text-xl mb-3">Why did we start the company?</h4>
                  <blockquote>
                    "We hope to build an entirely sustainable company that provides top-quality service to visitors, while at the same time, supporting the community and conserving our natural environment against global warming."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* --- BOTTOM: HORIZONTAL FEATURE BOXES --- */}
          <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="flex flex-col sm:flex-row items-start gap-6 p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 shrink-0 bg-[#F0F9FA] rounded-full flex items-center justify-center text-[#135D66]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="headingCSS text-2xl font-extrabold text-gray-900 mb-3">100% Local & Fair</h3>
                <p className="descCSS text-gray-600 leading-relaxed">We have the best camping logistics, the best guides and porters as well as a big variety of tours. We take care of your individual needs and wishes and provide the best quality to create an amazing time in Tanzania.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col sm:flex-row items-start gap-6 p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 shrink-0 bg-[#Fdf5e8] rounded-full flex items-center justify-center text-[#fe6e00]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <div>
                <h3 className="headingCSS text-2xl font-extrabold text-gray-900 mb-3">Our Vision</h3>
                <p className="descCSS text-gray-600 leading-relaxed">To become the leading company in all tourism activities by offering the best quality and individual tours to create an amazing and happy time for our customers.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 3. STATS BANNER                            */}
      {/* ========================================== */}
      {stats.length > 0 && (
        <section className="bg-[#135D66] py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
            <div className={`grid grid-cols-1 md:grid-cols-${stats.length > 4 ? 4 : stats.length} gap-10 divide-y md:divide-y-0 md:divide-x divide-white/20`}>
              {stats.map((stat, idx) => (
                <div key={stat.id} className={`text-center ${idx === 0 ? 'md:pt-0 pt-6 first:pt-0' : 'pt-8 md:pt-0'}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                    {statIcons[idx % statIcons.length]}
                  </div>
                  <h3 className="text-5xl font-black text-white mb-2">
                    <AnimatedCounter target={stat.value} duration={2000 + (idx * 200)} />{stat.suffix}
                  </h3>
                  <p className="text-lg text-white/80 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 4. OUR GOALS & VALUES (GRID)               */}
      {/* ========================================== */}
      <section className="py-20 xl:py-32 bg-[#FDFEFE]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className={`${caveat.className} text-[#fe6e00] text-3xl block mb-2`}>What drives us</span>
            <h2 className="headingCSS text-4xl md:text-5xl font-extrabold text-[#135D66] mb-6">Our Goals & Values</h2>
            <p className="descCSS text-gray-600 text-lg">
              We hope to build an entirely sustainable company that provides top-quality service to visitors, while at the same time, supporting the community and conserving our natural environment against global warming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Goals */}
            <div className="bg-[#F0F9FA] rounded-[40px] p-10 md:p-14 border border-[#135D66]/10">
              <h3 className="headingCSStext-3xl font-extrabold text-[#135D66] mb-8 border-b border-[#135D66]/20 pb-4">Our Goals</h3>
              <ul className="space-y-4">
                {[
                  "Create your unforgettable adventure",
                  "Provide the best quality services",
                  "Educate about Tanzanian culture and history",
                  "Offer memorable and enjoyable trekking and safari experience",
                  "Maintain a 100 percent locally owned company",
                  "Uphold the view of supporting our local community",
                  "Provide equitable working conditions to our employees"
                ].map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <FaCheckCircle className="text-[#fe6e00] mt-1 shrink-0 text-xl" />
                    <span className="descCSS text-gray-800 font-medium text-lg">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Values */}
            <div className="bg-[#F0F9FA] rounded-[40px] p-10 md:p-14 border border-[#135D66]/10">
              <h3 className="headingCSS text-3xl font-extrabold text-[#135D66] mb-8 border-b border-[#135D66]/20 pb-4">Our Values</h3>
              <ul className="space-y-4">
                {[
                  "Honesty and integrity",
                  "Transparency",
                  "Time management",
                  "Clients become our friends",
                  "Commitment to the culture and society",
                  "Work as a team by sharing knowledge, experience and dedication",
                  "Creativity and innovation from solidarity",
                  "Made by Tanzanians"
                ].map((value, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <FaCheckCircle className="text-[#fe6e00] mt-1 shrink-0 text-xl" />
                    <span className="descCSS text-gray-800 font-medium text-lg">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 5. VIDEO & RATINGS (WHY CHOOSE US)         */}
      {/* ========================================== */}
      <section className="py-20 xl:py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className={`${caveat.className} text-[#fe6e00] text-3xl block mb-2`}>Here's what they have to say</span>
            <h2 className="headingCSS text-4xl md:text-5xl font-extrabold text-[#135D66]">Why Choose Us?</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Video Container */}
            <div className="w-full lg:w-3/5">
              <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-black group">
                <iframe 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  src="https://www.youtube.com/embed/7vzEHwJp5wM?rel=0" 
                  title="Kilimanjaro hike lemosho route" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Ratings & Badges */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-10 text-center lg:text-left">
                Highly Rated On
              </h3>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-8 justify-center items-center lg:items-start">
                
                {/* TripAdvisor */}
                <a href="https://www.tripadvisor.com/Attraction_Review-g317084-d17594298-Reviews-Habari_Adventure-Moshi_Kilimanjaro_Region.html" className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 w-full max-w-[300px] hover:-translate-y-1 transition-transform">
                  <Image src="/tripadvisor-logo.png" alt="TripAdvisor" width={50} height={50} unoptimized />
                  <div>
                    <div className="flex text-[#34E0A1] text-sm mb-1">
                      <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                    <p className="font-bold text-gray-900">TripAdvisor</p>
                  </div>
                </a>

                {/* Bookmundi */}
                <a href="https://www.bookmundi.com/companies/habari-adventure/c2300" className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 w-full max-w-[300px] hover:-translate-y-1 transition-transform">
                  <Image src="/bookmundi-logo.png" alt="Bookmundi" width={50} height={50} unoptimized className="object-contain" />
                  <div>
                    <div className="flex text-[#fe6e00] text-sm mb-1">
                      <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                    <p className="font-bold text-gray-900">Bookmundi</p>
                  </div>
                </a>

                {/* Google Reviews */}
                <a href="https://maps.app.goo.gl/FEywkHZTxTBr7dCZ6" className="bg-white px-8 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 w-full max-w-[300px] hover:-translate-y-1 transition-transform">
                  <Image src="/google-reviews-logo.png" alt="Google Reviews" width={50} height={50} unoptimized className="object-contain" />
                  <div>
                    <div className="flex text-[#fe6e00] text-sm mb-1">
                      <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
                    </div>
                    <p className="font-bold text-gray-900">Google Reviews</p>
                  </div>
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. FEATURED CREW                           */}
      {/* ========================================== */}
      {featuredCrew.length > 0 && (
        <section className="py-20 xl:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-16 gap-6">
              <div className="text-center sm:text-left">
                <span className={`${caveat.className} text-[#fe6e00] text-3xl block mb-2`}>One Dream, One Team</span>
                <h2 className="headingCSS text-4xl md:text-5xl font-extrabold text-[#135D66]">Meet Our Crew</h2>
              </div>
              <Link 
                href="/crew" 
                className="bg-[#135D66] hover:bg-[#0f4a52] text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                See Full Crew
              </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCrew.map((member: any) => (
                <div 
                  key={member.id} 
                  className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <Image 
                    src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=135D66&color=fff`} 
                    alt={member.name} 
                    fill 
                    unoptimized
                    className="object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Member Details */}
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-xs font-medium text-[#fe6e00] uppercase tracking-wider mb-1 drop-shadow-md">
                      {member.designation}
                    </p>
                    <h4 className="text-xl font-extrabold text-white drop-shadow-md">
                      {member.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
// apps/web/app/equipment/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OurEquipmentPage() {
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

  const tableOfContents = [
    { id: "overview", label: "Overview" },
    { id: "mountain-tents", label: "Mountain Tents" },
    { id: "sleep-systems", label: "Sleep Systems" },
    { id: "private-toilets", label: "Private Toilets" },
    { id: "safari-vehicles", label: "Safari Vehicles" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* SEO TAGS */}
      <title>Our Equipment | Habari Adventure</title>
      <meta name="description" content="Learn about the high-quality equipment used by Habari Adventure. From trekking gear to safari essentials, we ensure your adventure is safe and comfortable." />

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
      <section className="relative w-full h-[55vh] min-h-[450px] flex flex-col justify-center -mt-[150px] pt-[120px] overflow-hidden bg-[#0a0f16]">
        <div className="absolute inset-0 z-0">
          {/* Placeholder Hero Image */}
          <Image 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1920" 
            alt="Our Equipment" 
            fill 
            unoptimized
            className="object-cover object-center"
            priority
          />
          {/* <div className="absolute inset-0 bg-black/60" /> */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center reveal-on-scroll is-visible">
          <span className="text-[#fe6e00] font-bold text-sm uppercase tracking-widest mb-4 block">
            Quality & Comfort
          </span>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4 drop-shadow-lg">
            Our Equipment
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-6">
            State-of-the-art mountain gear and customized 4x4 vehicles designed to elevate your Tanzanian adventure.
          </p>
          
          {/* CAVEAT / DISCLAIMER */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full mt-4">
            <svg className="w-4 h-4 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-gray-300 font-medium">
              High-quality branded equipment became an authentication mark of Habari Adventure.
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
                {tableOfContents.map((item) => (
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
              
              <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h5 className="font-bold text-gray-900 mb-2">Gear Rentals</h5>
                <p className="text-sm text-gray-600 mb-4">We provide rental options for sleeping bags and more at our Moshi office.</p>
                <Link href="/contact" className="text-sm font-bold text-[#fe6e00] hover:underline transition-colors">
                  Inquire about rentals ↗
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
                  Habari Adventure provided an excellent equipment for both Wildlife Safari and Kilimanjaro Adventure with high quality branded. All our equipment is from the Branded equipment company and they are spacious, comfortable and provide good insulation against wind on the upper slopes of Mount Kilimanjaro.
                </p>
                <p>
                  Normally we use excellent group equipment for the Kilimanjaro adventure. High-quality branded equipment, safari vehicles and gear became an authentication mark of the Habari Adventure.
                </p>
              </div>
            </div>

            {/* Mountain Tents */}
            <div id="mountain-tents" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Mountain Tents</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  We do provide both sleeping and dining tents. Therefore, you will sleep and eat in different tent.
                </p>
                
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Sleeping Tents</h3>
                <p>
                  Here in Habari Adventure Climbers will sleep in state of the art, four-season mountain tents during the trek. We designed a special walk-in Kilimanjaro and Safari tent, which will become an excellent option for all those who love comfort.
                </p>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 my-6 shadow-sm">
                  <ul className="list-none pl-0 m-0 space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-[#fe6e00] mt-1">✓</span>
                      <span>Normally using <strong>Mountain hardware</strong>, these tents are spacious enough to put a camp cot inside.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#fe6e00] mt-1">✓</span>
                      <span>Each two / three-person sized tent will comfortably house two climbers and their gear.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#fe6e00] mt-1">✓</span>
                      <span>The interior floor space is <strong>48 square feet</strong>, with a large vestibule, dual doors, and internal mesh pockets.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#fe6e00] mt-1">✓</span>
                      <span>Fully waterproof tent with fully taped seams and welded corners.</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Dining Tents</h3>
                <p>
                  Our dinning or “mess tents” are from the <strong>Rei outdoor equipment company</strong>. These dinner tents are connected by special tunnels, which makes climbing Mt Kilimanjaro during the rainy season way more comfortable. They are spacious, comfortable and provide good insulation against wind on the upper slopes of Mount Kilimanjaro.
                </p>
                <p>
                  In addition to mess tents you will be provided with a comfortable chair and table use during meals. Dinner is served around 6:00 to 6:30PM every day. Throughout the time of meal times is when you really get to know the others in your group. As dinner wraps up, your team of guides will come into the tent to give a briefing about the next day’s events.
                </p>
              </div>
            </div>

            {/* Sleep Systems */}
            <div id="sleep-systems" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Sleep Systems</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Mattress */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Thick Foam Mattress</h3>
                  <div className="prose text-gray-600">
                    <p>
                      Our sleeping mattress are thick, warm and comfortable, even for those not used to camping. Most of our clients are pleasantly surprised how well they manage to sleep on our trips.
                    </p>
                    <p>
                      A <strong>1.5-inch foam sleeping mattress</strong> is placed inside a washable cover for cleanliness provided to all climbers. Therefore, it is not necessary to bring another sleeping pad unless you really want to use your own, or perhaps to double up on mattress.
                    </p>
                  </div>
                </div>

                {/* Sleeping Bag */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sleeping Bags</h3>
                  <div className="prose text-gray-600">
                    <p>
                      Sleeping bags are available for rent on our rental store in Habari Adventure for <strong>$40 per trip (USD)</strong>. You do not need to reserve them ahead of time, you may hire one in our Kilimanjaro rentals store upon arrival at the trip briefing on the day before your climb.
                    </p>
                    <p>
                      Our Kilimanjaro recommendation is Lamina Z Blaze (Comfort Level -15°F / -26°C) by Mountain Hard ware and The North Face sleeping bags. Both are long enough to fit someone 6′ 6″ tall, weighs 5 lbs, 14 oz. and is temperature rated to -15F (-29C) or -30F (-34C), more than sufficient even for Kilimanjaro’s chilly nights. Ideally, your sleeping bag should have a hood to cover your head for better sleep at night.
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout */}
              <div className="mt-8 bg-[#111827] p-6 rounded-2xl border-l-4 border-[#fe6e00] shadow-md">
                <p className="text-white font-medium m-0">
                  <strong className="text-[#fe6e00] uppercase tracking-wider text-sm mr-2">Note:</strong> 
                  All of our rental sleeping bags are washed after every use and rented for only a short period before they are removed from the rental inventory.
                </p>
              </div>
            </div>

            {/* Private Toilets */}
            <div id="private-toilets" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Private Toilets</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  On Mt. Kilimanjaro there are "long drop" public toilets at every campsite. We provide private toilet tents for our clients on all of our climbs for an extra charge of <strong>120$</strong>.
                </p>
                <p>
                  Private toilets consist of a portable plastic toilet and a privacy tent. These will be set up by the toilet man at each campsite, he’s the one dealing with the cleanest of your portable toilet. You will be provided staff such as a designated “toilet porter” maintains the toilet tent to make sure it is clean and ready for use.
                </p>
              </div>
            </div>

            {/* Safari Vehicles */}
            <div id="safari-vehicles" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#fe6e00] mb-6">Our Safari Vehicles</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6 mb-10">
                <p>
                  A quality safari car is a must for an enjoyable safari. We have an excellent safari fleet of immaculately maintained Land Cruisers produced in <strong>2016-2022</strong> that we use. Our open-sided 4x4 Land Cruisers with tiered seating which are used during game drives allow you to feel closer to the wildlife and nature. Each vehicle is fitted with a fridge for refreshment drinks, Wi-Fi and power sockets. Convertible pop-up roof opens a panoramic 360° view and protects from the elements.
                </p>
                <p>
                  Habari Adventure uses only the best safari vehicles which have been customized to provide optimum safari experience. Our professional drivers are behind the wheels of models imported from Japan / Dubai, remodeled specifically for Tanzania’s terrain. These are all crucial for a memorable safari tour experience.
                </p>
                <p>
                  Vehicles are washed and sanitized before departure and are regularly maintained by a professional mechanic to ensure safety and security. The majority of our safari cars have <strong>6 seats in the rear</strong>, and a passenger seat beside the driver for a total of 7 seat. Additionally, all our Safari vehicles have everything that a client is looking ahead for the best safari. Expect to be into service of the following as soon as you make a Safari trip with Habari Adventure.
                </p>
              </div>

              {/* Safari Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Pop up roof</h4>
                  <p className="text-gray-600 text-sm">
                    Our jeep has a pop-up roof for 360-degree that can be removed so that you can have a better vantage for viewing while in the parks.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Large Window</h4>
                  <p className="text-gray-600 text-sm">
                    We made all the windows in the vehicle as large as possible so guest can have a better viewing taking pictures and sporting animal.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Wildlife Maps</h4>
                  <p className="text-gray-600 text-sm">
                    On your safari trail you will find a map of the area as well book guides about mammals and birds.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Refrigerator</h4>
                  <p className="text-gray-600 text-sm">
                    All our vehicles have a working small fridge to keep beverage, fruits and foods cold along the way. This is not to be taken for granted after a long day out in Savannah therefore, the fridge will be turned on throughout the game drive for the use.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Power inventors</h4>
                  <p className="text-gray-600 text-sm">
                    Inside the vehicles have 110v and 220v power adapter to make it possible to charge and keep your electronic device and cameras up and running.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">First Aid kit</h4>
                  <p className="text-gray-600 text-sm">
                    On every safari vehicle we provide a well-stocked first aid kit or medical kit with a collection of supplies and our guide are well trained to use all the equipment to give immediate medical treatment, primarily to treat injuries when happens during a game drive.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
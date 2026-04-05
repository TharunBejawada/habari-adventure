// apps/web/app/booking-policy/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BookingPolicyPage() {
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
    { id: "booking", label: "Booking & Payment" },
    { id: "cancellation", label: "Cancellation Policy" },
    { id: "visa", label: "VISA" },
    { id: "medical", label: "Medical Conditions" },
    { id: "climate", label: "Climate" },
    { id: "shopping", label: "Shopping Trips" },
    { id: "special", label: "Special Requirements" },
    { id: "suppliers", label: "Third Party Suppliers" },
    { id: "liability", label: "Liability & Force Majeure" },
    { id: "insurance", label: "Insurance & Law" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* SEO TAGS */}
      <title>Booking Policy | Habari Adventure</title>
      <meta name="description" content="Learn about Habari Adventure's booking policy. Find details on reservations, payments, cancellations, and terms for your adventure trips." />

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
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1920" 
            alt="Booking Policy" 
            fill 
            unoptimized
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center reveal-on-scroll is-visible">
          <span className="text-[#F51A43] font-bold text-sm uppercase tracking-widest mb-4 block">
            Terms & Conditions
          </span>
          <h1 className="text-white text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4 drop-shadow-lg">
            Booking Policy
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-6">
            Transparent and straightforward terms to ensure you have a seamless experience from booking to summit.
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
                {tableOfContents.map((item) => (
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
              
              {/* Quick Contact Box */}
              <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h5 className="font-bold text-gray-900 mb-2">Have Questions?</h5>
                <p className="text-sm text-gray-600 mb-4">Our team is ready to help clarify any part of our policy.</p>
                <Link href="/contact" className="text-sm font-bold text-white bg-[#111827] hover:bg-black py-2.5 px-6 rounded-full block text-center transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Right Col: Editorial Legal Content */}
          <div className="w-full lg:w-3/4 space-y-20">
            
            {/* Overview */}
            <div id="overview" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Overview</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  These Terms and Conditions apply to any tours booked with Habari Adventure, a local family owned Adventure Travel Company based in Moshi, Tanzania. These Terms & Conditions govern the contractual relationship between Habari Adventure and yourself. Please read these Terms and Conditions carefully as by booking any tour with Habari Adventure you acknowledge that you have read and understood these Terms and Conditions and you accept and agree to be bound by these Terms and Conditions.
                </p>
                <p>
                  If you have confirmed a booking on any tours with more than one client named and booked on such a booking, you shall be deemed to have accepted these Terms and Conditions on behalf of all clients named in the booking (including minors and those with a disability) and therefore all clients in that group indicate their acceptance and agreement to these Terms and Conditions. The client who confirmed the booking is considered to be the selected contact person for all other clients named in that booking.
                </p>
              </div>
            </div>

            {/* Booking & Payment Terms */}
            <div id="booking" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Booking & Payment Terms</h2>
              
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-8 items-center shadow-sm">
                <div className="w-16 h-16 bg-[#F51A43] text-white rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="prose prose-lg text-gray-700 max-w-none">
                  <p className="mb-0">
                    Your booking request has to be made in writing and a <strong>15% deposit</strong> is required. The balance has to be paid <strong>21 days before trip date</strong>. All payments should be free from bank chargers.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div id="cancellation" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Cancellation Policy</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>A client may cancel their booking by notifying Habari Adventure.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="font-bold text-[#F51A43] text-xl">(a)</span>
                    <div>
                      <p className="mb-4">Reservation that are cancelled, reduced in length of trip or reduced in numbers are subject to cancellation and no show fees as follows:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none pl-0">
                        <li className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-200 font-medium text-gray-800 flex justify-between items-center">
                          <span>0 - 7 days</span>
                          <span className="text-[#F51A43] font-bold text-xl">35%</span>
                        </li>
                        <li className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-200 font-medium text-gray-800 flex justify-between items-center">
                          <span>7 - 30 days</span>
                          <span className="text-[#F51A43] font-bold text-xl">20%</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-bold text-[#F51A43] text-xl">(b)</span>
                    <p>
                      Due to COVID -19 issue travel restrictions and flights cancellations may happen the date before the trip, so cancellation is free due to that and we can refund the money. On top of that we advice our client to postpone their trip until when things are okay, in case that happens and no additional costs will be required.
                    </p>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-bold text-[#F51A43] text-xl">(c)</span>
                    <p>
                      Tailor-made tours may be subject to alternative cancellation terms, which will be communicated to applicable clients at the time of booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* VISA & Medical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div id="visa" className="reveal-on-scroll scroll-mt-32">
                <h2 className="text-2xl font-extrabold text-[#F51A43] mb-4">VISA</h2>
                <div className="prose text-gray-600 max-w-none">
                  <p>
                    All nationals will require visa for TANZANIA. We recommend that where possible clients should attain their visas in advance, although they are available upon arrival in TANZANIA at the Airport.
                  </p>
                </div>
              </div>

              <div id="medical" className="reveal-on-scroll scroll-mt-32 delay-100">
                <h2 className="text-2xl font-extrabold text-[#F51A43] mb-4">Medical Conditions</h2>
                <div className="prose text-gray-600 max-w-none">
                  <p>
                    All clients are obligated to truthfully provide requested relevant medical information to us booking their tour. Clients are responsible for assessing their own suitability and capability to participate a tour with us. All clients should consult their physician regarding their fitness for taking part in the booked tour. Habari Adventure recommends all clients to seek their physician's advice regarding necessary or advisable vaccinations, medical precautions, or other medical concerns regarding the entirety of the client's travel with Habari Adventure does not provide medical advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Climate & Shopping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div id="climate" className="reveal-on-scroll scroll-mt-32">
                <h2 className="text-2xl font-extrabold text-[#F51A43] mb-4">Climate</h2>
                <div className="prose text-gray-600 max-w-none">
                  <p>
                    The climate is hot and sometimes humid. From December to March when the north east monsoon blows, it is hot and humid. In April and May heavy rains occurs with June to October being the coolest and driest period. The lesser rains falls in November, temperature sways between 25 degrees Celsius and 35 degrees Celsius and annual rainfall is about 20mm.
                  </p>
                </div>
              </div>

              <div id="shopping" className="reveal-on-scroll scroll-mt-32 delay-100">
                <h2 className="text-2xl font-extrabold text-[#F51A43] mb-4">Shopping Trips</h2>
                <div className="prose text-gray-600 max-w-none">
                  <p>
                    Driver / guide will stop at the shop / curios stall which are recommended by Habari Adventure. We provide 100% escort at no extra costs to accompany guest on shopping trips so as to help with recommendation and save.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div id="special" className="reveal-on-scroll scroll-mt-32 bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Special Requirements</h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-0 font-medium">
                  Habari Adventure will strive to accommodate the special requests of clients, including (without limitation) dietary and accommodation requests.
                </p>
              </div>
            </div>

            {/* Third Party Suppliers */}
            <div id="suppliers" className="reveal-on-scroll scroll-mt-32">
              <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Third Party Suppliers</h2>
              <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                <p>
                  Habari Adventure makes arrangements with accommodation providers, activity providers, airlines, coach companies, transfer operators, shore excursion operators, tour and local guides, and other independent parties ("Third Party Suppliers") to provide you with the travel services and other services you purchase or which form the component parts of your product Tour.
                </p>
                <p>
                  Third Party Suppliers may also engage the services of local operators and/or sub-contractors for the provision of travel services that form part of the tour(s). Although Habari Adventure takes all reasonable care in selecting Third Party Suppliers, Habari Adventure is unable to control Third Party Suppliers and do not supervise Third Party Suppliers and therefore cannot be responsible for their acts or omissions.
                </p>
                <p>
                  The travel services and other services provided are subject to the conditions imposed by these suppliers and their liability is limited by their tariffs, conditions of carriage, tickets and vouchers and international conventions and agreements that govern the provision of their services. These may limit or exclude liability of the supplier. Client acknowledges that Third Party Suppliers operate in compliance with the applicable laws of Tanzania and Habari Adventure does not warrant that any Third Party Supplier is in compliance with the laws of the client's country of residence, or any other jurisdiction.
                </p>
              </div>
            </div>

            {/* Liability & Force Majeure */}
            <div id="liability" className="reveal-on-scroll scroll-mt-32 space-y-12">
              
              <div>
                <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Liability</h2>
                <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                  <p>
                    Habari Adventure act as agent for hotels, transportations services and facilities provided by other parties, firms or corporation and cannot be held responsible for delays, injury, damage or accident, change of itineraries which may occur through the negligence of client.
                  </p>
                  <p className="bg-red-50 text-red-900 p-6 rounded-xl border border-red-100 font-medium">
                    Please clients advised to take precautions against Malaria prior to the commencement of their holiday. We recommend contacting pharmacists for advice as to which prophylactic is recommended.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-[#F51A43] mb-6">Force Majeure</h2>
                <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                  <p>
                    The company accepts any liability/pay in compensation in respect to delays or lack of performance affected by force majeure.
                  </p>
                  <p>
                    Force majeure means any event which the company has no controls over and even in circumstances where all due care was taken the event could not have been avoided/foreseen. This includes events such as war/threat of war riot civil stifle, terrorist activity, industrial dispute, natural disaster, adverse weather conditions, fire and all similar events outside the company control.
                  </p>
                </div>
              </div>

            </div>

            {/* Insurance & Law */}
            <div id="insurance" className="reveal-on-scroll scroll-mt-32 border-t border-gray-200 pt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#F51A43]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Insurance
                </h2>
                <p className="text-gray-600 text-lg">
                  You are strongly advised to take adequate insurance against all risk for an adequate sum.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#F51A43]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                  Law
                </h2>
                <p className="text-gray-600 text-lg">
                  The company's contract will be governed by constructed in accordance with the law of Tanzania. Accordingly each party irrevocably submits to the jurisdiction of the Tanzania courts to settle and matter arising under this contract.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
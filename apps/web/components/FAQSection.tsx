// apps/web/components/FAQSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";
import { useLocalizedUrl } from "../hooks/useLocalizedUrl";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

const faqs = [
  {
    question: "What is the best time for Tanzania safari tours?",
    answer: (
      <>
        The dry season from <strong>June to October</strong> is ideal for wildlife viewing, especially for a Serengeti safari during the Great Migration. January and February are also excellent for the calving season.
      </>
    ),
  },
  {
    question: "How difficult is Kilimanjaro climbing?",
    answer: (
      <>
        Kilimanjaro climbing does not require technical mountaineering skills. However, it demands physical preparation and proper acclimatization. Choosing experienced Kilimanjaro tours significantly increases summit success rates.
      </>
    ),
  },
  {
    question: "How long should a Tanzania safari package be?",
    answer: (
      <>
        Most Tanzania safari packages range between <strong>5 to 10 days</strong>. This allows travelers to explore the Serengeti, Ngorongoro, and Tarangire comfortably without feeling rushed.
      </>
    ),
  },
  {
    question: "Is Habari Adventure a licensed tour operator in Tanzania?",
    answer: (
      <>
        <strong>Yes.</strong> Habari Adventure is a locally registered and certified tour operator in Tanzania, providing expertly guided safari and trekking experiences.
      </>
    ),
  },
];

export default function FAQSection() {
  const { getLocalizedUrl } = useLocalizedUrl();
  const [activeIndex, setActiveIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-12 lg:py-24 bg-white relative overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F2F8F8] rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row items-start gap-12 lg:gap-20 relative z-10">
        
        {/* --- LEFT SIDE: Sticky Header & Intro --- */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-32">
          <img src="/q_a.png" alt="Travel Goals Icon" className="w-24 h-24 mb-3 mt-4 group-hover:scale-110 transition-transform duration-300 object-contain" />
          <span className={`${caveat.className} text-3xl md:text-4xl text-[#fe6e00] block mb-2 tracking-normal`}>
            Got Questions?
          </span>
          <h2 className="headingCSS text-3xl md:text-5xl font-extrabold text-[#135D66] leading-tight mb-6">
            Frequently Asked <br /> Questions
          </h2>
          <p className="descCSS text-gray-500 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            Planning an African adventure involves a lot of details. Here are answers to the most common questions we get about our Tanzania safari tours and Kilimanjaro expeditions.
          </p>

          {/* Contact Support Mini-Card */}
          <div className="bg-[#F6FBFB] border border-[#135D66]/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm inline-flex">
            <div className="w-16 h-16 rounded-full bg-[#135D66] text-white flex items-center justify-center shrink-0">
              {/* <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg> */}
              <img src="/help.png" alt="Travel Goals Icon" className="w-12 h-12 mb-3 mt-4 group-hover:scale-110 transition-transform duration-300 object-contain" />
            </div>
            <div>
              <h4 className="descCSS text-[#135D66] font-bold mb-1">Still need help?</h4>
              <p className="descCSS text-gray-500 text-xs md:text-sm mb-3">Our travel experts are here 24/7.</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a href={getLocalizedUrl("/contact")} className="descCSS text-[#fe6e00] font-bold text-sm hover:underline flex items-center gap-1">
                  Contact Us 
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <span className="text-gray-300">|</span>

                <a href="https://wa.me/255762992308" target="_blank" rel="noopener noreferrer" className="descCSS text-[#25D366] font-bold text-sm hover:underline flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Accordion List --- */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;

            return (
              <div 
                key={index} 
                className={`w-full rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isActive ? "bg-white border-[#135D66] shadow-[0_8px_30px_rgb(0,0,0,0.08)]" : "bg-white border-gray-100 hover:border-[#135D66]/30 shadow-sm"
                }`}
              >
                {/* Question Header (Clickable) */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                >
                  <h3 className={`headingCSS font-bold text-lg md:text-xl pr-6 transition-colors duration-300 ${isActive ? "text-[#135D66]" : "text-gray-800"}`}>
                    {faq.question}
                  </h3>
                  
                  {/* Plus/Minus Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? "bg-[#135D66] text-[#fe6e00]" : "bg-gray-100 text-gray-500"}`}>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${isActive ? "rotate-180" : "rotate-0"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      {isActive ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </div>
                </button>

                {/* Answer Body (Animated Height) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="descCSS px-6 md:px-8 pb-6 md:pb-8 pt-0 text-gray-600 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
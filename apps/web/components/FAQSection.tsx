// apps/web/components/FAQSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(0); // First item open by default

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 lg:py-32 bg-white relative overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F2F8F8] rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row items-start gap-12 lg:gap-20 relative z-10">
        
        {/* --- LEFT SIDE: Sticky Header & Intro --- */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-32">
          <span className={`${caveat.className} text-[#E59A1D] text-3xl md:text-4xl tracking-wide mb-2 block`}>
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#135D66] leading-tight mb-6">
            Frequently Asked <br /> Questions
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 max-w-md">
            Planning an African adventure involves a lot of details. Here are answers to the most common questions we get about our Tanzania safari tours and Kilimanjaro expeditions.
          </p>

          {/* Contact Support Mini-Card */}
          <div className="bg-[#F6FBFB] border border-[#135D66]/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm inline-flex">
            <div className="w-12 h-12 rounded-full bg-[#135D66] text-white flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[#135D66] font-bold mb-1">Still need help?</h4>
              <p className="text-gray-500 text-xs md:text-sm mb-3">Our travel experts are here 24/7.</p>
              <a href="/contact" className="text-[#E59A1D] font-bold text-sm hover:underline flex items-center gap-1">
                Contact Us 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
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
                  <h3 className={`font-bold text-lg md:text-xl pr-6 transition-colors duration-300 ${isActive ? "text-[#135D66]" : "text-gray-800"}`}>
                    {faq.question}
                  </h3>
                  
                  {/* Plus/Minus Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? "bg-[#135D66] text-[#E59A1D]" : "bg-gray-100 text-gray-500"}`}>
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
                    <p className="px-6 md:px-8 pb-6 md:pb-8 pt-0 text-gray-600 text-sm md:text-base leading-relaxed">
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
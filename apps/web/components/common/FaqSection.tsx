"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-[#F9FAFB] border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4 notranslate">
          {faqs.map((faq, idx) => {
            if (!faq?.question) return null;
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-6 hover:bg-[#E9F4F5] text-left transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[#135D66] pr-4 text-lg leading-snug">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-[#fe6e00] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="p-6 bg-white text-gray-600 text-lg leading-relaxed border-t border-gray-100">
                    {faq.answer?.replace(/&nbsp;/g, ' ') || ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
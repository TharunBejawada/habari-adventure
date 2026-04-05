// apps/web/components/contact/ContactLocation.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function ContactLocation() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll Intersection Observer for Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-16 lg:py-24 bg-[#FDFEFE] relative z-10">
      
      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up-scroll {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `
      }} />

      <div className={`max-w-[1300px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col items-center text-center opacity-0 ${isVisible ? 'animate-fade-in-up-scroll' : ''}`}>
        
        {/* Accent & Title */}
        <span className={`${caveat.className} text-[#E59A1D] text-3xl md:text-4xl tracking-wide mb-2 block`}>
          Find Us Here
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#135D66] mb-6">
          Office & Location
        </h2>
        
        {/* Description */}
        <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed mb-12">
          We are based in Moshi–Kilimanjaro, Tanzania. If you’re already in Tanzania, contact us to arrange a briefing before your trip!
        </p>

        {/* --- GOOGLE MAP WRAPPER --- */}
        {/* Uses a rounded, shadow-heavy container to make the map look premium instead of just a blocky iframe */}
        <div className="w-full h-[350px] md:h-[500px] rounded-[30px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mb-12 relative bg-gray-100">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63728.20379317035!2d37.34370164999999!3d-3.3469983500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1839d98b4382f25b%3A0x6c941054185e568!2sHabari%20Adventure!5e0!3m2!1sen!2sin!4v1773477400099!5m2!1sen!2sin" // Using a valid embed URL for Moshi
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Habari Adventure Office Location"
            className="w-full h-full object-cover"
          ></iframe>
        </div>

        {/* --- PRIVACY LINE --- */}
        {/* <div className="w-full max-w-3xl border-t border-gray-200 pt-8 mt-4">
          <p className="text-gray-400 text-xs md:text-sm font-medium">
            <span className="font-bold text-gray-500">Privacy:</span> By submitting the form above, you agree that we may contact you about your trip request. Your information is secure and will never be shared with third parties.
          </p>
        </div> */}

      </div>
    </section>
  );
}
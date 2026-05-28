// apps/web/components/packages/Testimonials.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Testimonials() {
  // Animation variants for the split layout
  const fadeLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" as const } 
    },
  };

  const containerRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" as const } 
    },
  };

  return (
    <section className="py-4 lg:py-12 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        
        {/* Left Col: Image */}
        <motion.div 
          className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeLeftVariants}
        >
          {/* Removed shadow and rounded corners to allow a transparent PNG to sit naturally */}
          <div className="relative w-full max-w-[600px] h-[450px] md:h-[600px]">
            <Image 
              src="/happy-trekkers.png" // Update with your actual image path
              alt="Happy Trekkers" 
              fill 
              className="object-contain object-bottom" 
            />
          </div>
        </motion.div>

        {/* Right Col: Content */}
        <motion.div 
          className="w-full lg:w-1/2 max-w-[600px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerRightVariants}
        >
          <motion.p variants={itemVariants} className="text-[#fe6e00] font-bold text-[11px] uppercase tracking-wider mb-4">
            What Our Travellers Say
          </motion.p>
          
          <motion.h2 variants={itemVariants} className="text-4xl md:text-[3.25rem] leading-[1.1] font-bold text-black mb-6 tracking-tight">
            Real Stories From Happy <br className="hidden md:block" /> Trekkers
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-black text-[15px] leading-[1.8] mb-8 pr-4">
            From the 8-day Lemosho trek on Kilimanjaro to a thrilling 4-day Serengeti safari, every moment was flawlessly organized by this locally-owned company. The team was incredibly responsive, the guides were outstanding, the gear was in excellent condition, and freshly prepared meals made the experience even more memorable. Truly a seamless, safe, and unforgettable adventure.
          </motion.p>

          <motion.div variants={itemVariants} className="mb-10">
            <p className="text-[#fe6e00] font-medium text-xl mb-1">~ Sarah b</p>
            <p className="text-black text-[13px] mb-3">Date of experience: February 2024</p>
            <a href="https://www.tripadvisor.com/Attraction_Review-g317084-d17594298-Reviews-Habari_Adventure-Moshi_Kilimanjaro_Region.html" target="_blank" rel="noopener noreferrer" className="text-black text-[13px] font-medium hover:text-[#fe6e00] transition-colors flex items-center gap-1">
              Read full testimonial 
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-[11px] font-bold text-black mb-5 tracking-wide">
              Click any of the below to read more testimonials
            </p>
            
            {/* Logos */}
            <div className="flex items-center gap-8">
              <a href="https://www.tripadvisor.com/Attraction_Review-g317084-d17594298-Reviews-Habari_Adventure-Moshi_Kilimanjaro_Region.html" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/tripadvisor-logo.png" // Update path
                  alt="Tripadvisor" 
                  className="h-10 object-contain" 
                />
              </a>
              <a href="https://maps.app.goo.gl/FEywkHZTxTBr7dCZ6" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/google-reviews-logo.png" // Update path
                  alt="Google Reviews" 
                  className="h-10 object-contain" 
                />
              </a>
              <a href="https://www.bookmundi.com/companies/habari-adventure/c2300" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/bookmundi-logo.png" // Update path
                  alt="Bookmundi" 
                  className="h-7 object-contain" 
                />
              </a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
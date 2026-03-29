// apps/web/components/packages/PreparationGuide.tsx
"use client";

import { motion } from "framer-motion";

export default function PreparationGuide() {
  // Animation variants for staggered fade-in effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" as const } 
    },
  };

  return (
    <section className="py-4 lg:py-12 bg-[#fafafa] overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div className="mb-16" variants={itemVariants}>
          <h2 className="text-[2.75rem] leading-tight font-bold text-black mb-3 tracking-tight">
            Preparation <span className="text-[#F51A43]">Guide</span>
          </h2>
          <p className="text-black text-[1.1rem]">
            Train smart, pack right, and understand altitude for a safer, happier summit push.
          </p>
        </motion.div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Fitness & Training */}
          <motion.div variants={itemVariants}>
            <div className="flex items-end gap-4 mb-6">
              {/* Replace src with your actual image path */}
              <img 
                src="/fitness-icon.png" 
                alt="Fitness and Training" 
                className="w-16 h-16 object-contain"
              />
              <h3 className="text-[1.35rem] font-medium text-[#F51A43] pb-1">Fitness & Training</h3>
            </div>
            <div className="space-y-0 text-black text-[15px] leading-[1.8]">
              <p>8–12 weeks of progressive hikes;</p>
              <p>add back-to-back long walks</p>
              <p>Strength work for legs & core;</p>
              <p>stair sessions</p>
              <p>Pace yourself: pole pole (slowly)</p>
              <p>conserves energy</p>
            </div>
          </motion.div>

          {/* Altitude & Health */}
          <motion.div variants={itemVariants}>
            <div className="flex items-end gap-4 mb-6">
              {/* Replace src with your actual image path */}
              <img 
                src="/altitude-icon.png" 
                alt="Altitude and Health" 
                className="w-16 h-16 object-contain"
              />
              <h3 className="text-[1.35rem] font-medium text-[#F51A43] pb-1">Altitude & Health</h3>
            </div>
            <div className="space-y-0 text-black text-[15px] leading-[1.8]">
              <p>Acclimatize by climbing high,</p>
              <p>sleeping low</p>
              <p>Hydrate well; watch for symptoms;</p>
              <p>tell your guide early</p>
              <p>Daily checks with oximeter;</p>
              <p>conservative decision-making</p>
            </div>
          </motion.div>

          {/* Packing Essentials */}
          <motion.div variants={itemVariants}>
            <div className="flex items-end gap-4 mb-6">
              {/* Replace src with your actual image path */}
              <img 
                src="/packing-icon.png" 
                alt="Packing Essentials" 
                className="w-16 h-16 object-contain"
              />
              <h3 className="text-[1.35rem] font-medium text-[#F51A43] pb-1">Packing Essentials</h3>
            </div>
            <div className="space-y-0 text-black text-[15px] leading-[1.8]">
              <p>Broken-in boots, camp shoes,</p>
              <p>trekking poles</p>
              <p>Layering: base, mid, waterproof shell;</p>
              <p>warm hat & gloves</p>
              <p>0 to -10°C sleeping bag (<span className="text-[#F51A43]">rental available</span>)</p>
              <p>Daypack 25–35L + rain cover;</p>
              <p>2–3L hydration</p>
              <p>Headlamp, sunglasses (UV), sunscreen,</p>
              <p>personal meds, power bank</p>
            </div>
          </motion.div>

        </div>

        {/* Footer Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 pt-4"
        >
          <p className="text-black text-lg">
            <span className="text-[#F51A43]">Need rentals?</span> Reserve sleeping bags, down jackets, and poles in advance.
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}
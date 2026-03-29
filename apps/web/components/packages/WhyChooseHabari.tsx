// apps/web/components/packages/WhyChooseHabari.tsx
"use client";

import { motion } from "framer-motion";

export default function WhyChooseHabari() {
  const reasons = [
    { title: "13+ Years", desc: "of Tanzania safari expertise" },
    { title: "100% Tailored itineraries", desc: "to match your dreams" },
    { title: "Eco-Conscious tourism", desc: "that supports local communities" },
    { title: "5-Star Rated", desc: "by 500+ satisfied travelers" },
    { title: "Luxury Camps & Lodges", desc: "handpicked for comfort" },
    { title: "Qualified guides", desc: "with extensive training" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <section className="relative pt-16 lg:pt-24 pb-0 bg-[#FAFAFA] overflow-hidden min-h-[600px] flex items-center">
      
      {/* --- BACKGROUND IMAGES --- */}
      {/* Top Line Art (Clouds, Plane, Balloon) with subtle float animation */}
      <motion.div 
        animate={floatAnimation}
        className="absolute top-0 left-0 w-full h-[300px] md:h-[400px] z-0 pointer-events-none opacity-80"
      >
        <img 
          src="/habari-bg-top.png" // Update with your actual top background image path
          alt="" 
          className="w-full h-full object-cover object-top" 
        />
      </motion.div>

      {/* Bottom Line Art (City, Safari, Trees) */}
      <div className="absolute bottom-0 left-0 w-full h-[250px] md:h-[350px] z-0 pointer-events-none">
        <img 
          src="/habari-bg-bottom.png" // Update with your actual bottom background image path
          alt="" 
          className="w-full h-full object-cover object-bottom" 
        />
      </div>


      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 lg:mb-16" // Slightly reduced margin to bring text closer to title
        >
          <h2 className="text-4xl md:text-[3rem] font-bold text-black tracking-tight">
            Why Choose <span className="text-[#F51A43]">Habari Adventure?</span>
          </h2>
        </motion.div>

        {/* Removed 'items-end' from this wrapper so items can behave independently */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 justify-between">
          
          {/* Left Col: Features Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            // Added 'self-start' to anchor text to the top, removed huge pb-32
            className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-12 pb-12 self-start pt-2"
          >
            {reasons.map((reason, idx) => (
              <motion.div key={idx} variants={itemVariants} className="max-w-xs">
                <h4 className="text-[1.3rem] font-medium text-[#F51A43] mb-1">
                  {reason.title}
                </h4>
                <p className="text-black text-[15px] font-normal leading-snug">
                  {reason.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Col: Family Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            // Added 'self-end mt-auto' to ensure the image stays anchored to the bottom baseline
            className="w-full lg:w-2/5 flex justify-center lg:justify-end relative z-20 self-end mt-auto"
          >
            <div className="relative w-full max-w-[500px] h-[400px] md:h-[600px]">
              <img 
                src="/habari-family.png" // Update with your actual transparent family PNG path
                alt="Family Travelers" 
                className="w-full h-full object-contain object-bottom" 
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
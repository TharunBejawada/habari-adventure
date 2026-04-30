// apps/web/components/packages/NextJourneyCTA.tsx
"use client";

import { motion, easeInOut } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi"; // Feather icons give that clean, thin-line look

export default function NextJourneyCTA() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeInOut } },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 15 } 
    },
  };

  return (
    // Added pt-12 to give a little breathing room at the top, removed min-h entirely
    <section className="relative pt-12 bg-[#FAFAFA] border-b-[6px] border-[#98D80D] overflow-hidden flex items-end">
    
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full">
        
        {/* Reverted to lg:items-end to keep the container tight around the image */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 lg:gap-12">
          
          {/* Left: Image Group (Excited Travelers) */}
          <motion.div 
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full lg:w-[45%] flex justify-center lg:justify-start"
          >
            {/* Reduced the max heights here to ensure the section doesn't get too tall */}
            <div className="relative w-full max-w-[550px] h-[250px] md:h-[300px] lg:h-[350px]">
               <img 
                src="/excited-group.png" // Update with your actual transparent cutout image path
                alt="Excited Travelers" 
                className="w-full h-full object-contain object-bottom" 
              />
            </div>
          </motion.div>

          {/* Middle: Text */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            // Added lg:mb-12 to push the text up from the bottom border, centering it visually
            className="w-full lg:w-[35%] text-center lg:text-left lg:mb-12"
          >
            <motion.h2 
              variants={textVariants}
              className="text-3xl md:text-[2.5rem] font-bold text-[#98D80D] mb-4 leading-[1.15] tracking-tight"
            >
              Excited to start your <br className="hidden lg:block" /> next journey?
            </motion.h2>
            <motion.p 
              variants={textVariants}
              className="text-black text-[15px] leading-relaxed pr-0 lg:pr-4"
            >
              Share your travel dreams, and we'll create a custom itinerary tailored just for you - delivered in under 3 hours.
            </motion.p>
          </motion.div>

          {/* Right: Contact Icons */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            // Added lg:mb-12 to push the icons up from the bottom border to match the text
            className="w-full lg:w-[20%] flex items-center justify-center lg:justify-end gap-8 pb-10 lg:pb-0 lg:mb-12"
          >
            
            {/* WhatsApp */}
            <motion.a 
              href="#" 
              variants={iconVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-[85px] h-[85px] rounded-full border-[2.5px] border-[#333] flex items-center justify-center text-[#333] group-hover:border-[#25D366] group-hover:text-[#25D366] transition-colors duration-300 bg-transparent">
                <FaWhatsapp className="w-9 h-9" />
              </div>
              <span className="font-medium text-black text-[15px] leading-tight text-center group-hover:text-[#25D366] transition-colors">
                Chat on<br/>WhatsApp
              </span>
            </motion.a>

            {/* Email / Enquiry */}
            <motion.a 
              href="#" 
              variants={iconVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-[85px] h-[85px] rounded-full border-[2.5px] border-[#333] flex items-center justify-center text-[#333] group-hover:border-[#98D80D] group-hover:text-[#98D80D] transition-colors duration-300 bg-transparent">
                <FiMail className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-black text-[15px] leading-tight text-center group-hover:text-[#98D80D] transition-colors">
                Send an<br/>Enquiry
              </span>
            </motion.a>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
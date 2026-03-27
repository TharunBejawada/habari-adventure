// apps/web/components/packages/NextJourneyCTA.tsx
"use client";
import Image from "next/image";

export default function NextJourneyCTA() {
  return (
    <section className="pb-16 lg:pb-24 pt-8 bg-[#F9FAFB] relative overflow-hidden reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 border border-gray-100">
          
          {/* Left: Image Group */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <div className="relative w-full max-w-[300px] h-[200px] rounded-2xl overflow-hidden shadow-inner">
               {/* Unsplash fallback for excited group */}
               <Image 
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=800" 
                alt="Excited Travelers" 
                fill 
                unoptimized 
                className="object-cover" 
              />
            </div>
          </div>

          {/* Middle: Text */}
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#F51A43] mb-4 leading-tight">
              Excited to start your <br className="hidden lg:block" /> next journey?
            </h2>
            <p className="text-gray-700 font-medium text-sm md:text-base leading-relaxed">
              Share your travel dreams, and we'll create a custom itinerary tailored just for you - delivered in under 3 hours.
            </p>
          </div>

          {/* Right: Contact Icons */}
          <div className="w-full lg:w-1/3 flex items-center justify-center gap-8">
            
            {/* WhatsApp */}
            <a href="#" className="group flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-[#25D366] group-hover:text-[#25D366] group-hover:bg-green-50 transition-all duration-300 shadow-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.395 0 0 5.394 0 12.031c0 2.128.552 4.195 1.603 6.019L.234 24l6.141-1.611c1.765.952 3.753 1.455 5.804 1.455h.004c6.634 0 12.031-5.394 12.031-12.031C24.215 5.395 18.665 0 12.031 0zm0 21.879h-.004c-1.802 0-3.567-.484-5.114-1.398l-.367-.217-3.8.997.997-3.7-.238-.378C2.531 15.541 2.016 13.822 2.016 12.031c0-5.523 4.493-10.016 10.015-10.016 5.522 0 10.016 4.493 10.016 10.016 0 5.523-4.494 10.016-10.016 10.016zm5.498-7.518c-.302-.151-1.787-.883-2.064-.984-.277-.101-.479-.151-.68.151s-.782.984-.959 1.185c-.176.201-.352.227-.654.076-1.666-.827-2.91-1.587-4.004-3.411-.115-.192-.012-.296.139-.447.135-.135.302-.352.453-.528.151-.176.201-.302.302-.503.101-.201.05-.378-.025-.528-.076-.151-.68-1.639-.933-2.243-.245-.589-.494-.509-.68-.518-.176-.009-.378-.009-.579-.009s-.528.076-.805.378c-.277.302-1.056 1.033-1.056 2.518s1.082 2.914 1.233 3.116c.151.201 2.128 3.25 5.158 4.557.72.31 1.282.495 1.722.634.723.228 1.381.196 1.902.119.585-.087 1.787-.73 2.038-1.436.252-.706.252-1.311.176-1.436-.075-.126-.277-.201-.579-.352z"/></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm group-hover:text-[#25D366] transition-colors">Chat on<br/>WhatsApp</span>
            </a>

            {/* Email / Enquiry */}
            <a href="#" className="group flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-[#F51A43] group-hover:text-[#F51A43] group-hover:bg-red-50 transition-all duration-300 shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm group-hover:text-[#F51A43] transition-colors text-center">Send an<br/>Enquiry</span>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}
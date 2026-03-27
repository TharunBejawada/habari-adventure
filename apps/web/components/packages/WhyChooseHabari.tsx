// apps/web/components/packages/WhyChooseHabari.tsx
"use client";
import Image from "next/image";

export default function WhyChooseHabari() {
  const reasons = [
    { title: "13+ Years", desc: "of Tanzania safari expertise" },
    { title: "100% Tailored itineraries", desc: "to match your dreams" },
    { title: "Eco-Conscious tourism", desc: "that supports local communities" },
    { title: "5-Star Rated", desc: "by 500+ satisfied travelers" },
    { title: "Luxury Camps & Lodges", desc: "handpicked for comfort" },
    { title: "Qualified guides", desc: "with extensive training" },
  ];

  return (
    <section className="pt-16 lg:pt-24 pb-8 bg-[#F9FAFB] relative overflow-hidden reveal-on-scroll">
      {/* Simulate the background line-art texture (Optional CSS pattern) */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        
        <div className="text-center md:text-left mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Why Choose <span className="text-[#F51A43]">Habari Adventure?</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center">
          
          {/* Left Col: Features Grid */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
            {reasons.map((reason, idx) => (
              <div key={idx}>
                <h4 className="text-xl font-bold text-[#F51A43] mb-1">{reason.title}</h4>
                <p className="text-gray-700 font-medium text-sm md:text-base leading-snug">{reason.desc}</p>
              </div>
            ))}
          </div>

          {/* Right Col: Family Image */}
          <div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[400px] h-[300px] md:h-[400px]">
              {/* Unsplash fallback for the traveling family */}
              <Image 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800" 
                alt="Family Travelers" 
                fill 
                unoptimized 
                className="object-cover rounded-2xl shadow-lg" 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
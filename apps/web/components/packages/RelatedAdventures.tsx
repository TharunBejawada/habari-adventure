// apps/web/components/packages/RelatedAdventures.tsx
"use client";
import Image from "next/image";

export default function RelatedAdventures({ currentCategory }: { currentCategory: string }) {
  // Determine if we are looking at a climb. If so, suggest a safari, and vice versa.
  const isClimbing = currentCategory?.toLowerCase().includes("climb") || currentCategory?.toLowerCase().includes("trek");
  
  const title = isClimbing ? "Add a Safari" : "Add a Trek";
  const subtitle = isClimbing 
    ? "Turn your summit into a full Tanzania adventure." 
    : "Conquer the roof of Africa before you unwind.";
  const buttonText = isClimbing ? "BUILD MY TREK + SAFARI" : "BUILD MY SAFARI + TREK";

  // Static mock data to match design
  const items = isClimbing ? [
    {
      title: "Great Migration Safari",
      desc: "Witness nature's greatest spectacle in Serengeti National Park",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
      bullets: ["7-day luxury safari", "Prime migration viewing locations", "Hot air balloon option available"]
    },
    {
      title: "Kilimanjaro Trek & Safari Combo",
      desc: "Conquer Africa's rooftop then unwind on safari",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
      bullets: ["12-day adventure package", "Certified mountain guides", "5-star safari lodges"]
    },
    {
      title: "Family-Friendly Tanzania Explorer",
      desc: "Perfect introduction to Africa for all ages",
      image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=800",
      bullets: ["Kid-friendly activities", "Swimming pool accommodations", "Cultural village visits"]
    }
  ] : [
    {
      title: "Lemosho Route Ascent",
      desc: "The most scenic and successful path to the summit",
      image: "https://images.unsplash.com/photo-1589182373814-4d1bc917d057?auto=format&fit=crop&q=80&w=800",
      bullets: ["8-day acclimatization profile", "High summit success rate", "Quiet wilderness approach"]
    },
    {
      title: "Machame Route Challenge",
      desc: "The popular 'Whiskey Route' for adventurous trekkers",
      image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?auto=format&fit=crop&q=80&w=800",
      bullets: ["7-day steep ascent", "Incredible changing landscapes", "Camp at iconic Barranco Wall"]
    },
    {
      title: "Mt. Meru Acclimatization",
      desc: "A spectacular 4-day trek and the perfect Kilimanjaro warm-up",
      image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&q=80&w=800",
      bullets: ["4-day uncrowded trek", "Walk among wild animals", "Incredible views of Kili"]
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              {title.split(" ")[0]} {title.split(" ")[1]} <span className="text-[#fe6e00]">{title.split(" ")[2]}</span>
            </h2>
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          </div>
          <button className="bg-[#fe6e00] hover:bg-[#d41538] text-white font-bold py-3 px-8 rounded-full text-xs uppercase tracking-widest transition-colors shrink-0 shadow-md">
            {buttonText}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative w-full h-[220px] rounded-xl overflow-hidden mb-6">
                <Image src={item.image} alt={item.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="text-xl font-bold text-[#fe6e00] mb-2 group-hover:text-[#d41538] transition-colors">{item.title}</h3>
              <p className="text-gray-900 font-medium mb-4 leading-snug">{item.desc}</p>
              <ul className="space-y-1.5">
                {item.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
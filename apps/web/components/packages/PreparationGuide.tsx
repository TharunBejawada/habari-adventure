// apps/web/components/packages/PreparationGuide.tsx
"use client";

export default function PreparationGuide() {
  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Preparation <span className="text-[#F51A43]">Guide</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Train smart, pack right, and understand altitude for a safer, happier summit push.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Fitness & Training */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <h3 className="text-xl font-bold text-[#F51A43]">Fitness & Training</h3>
            </div>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              <li>8-12 weeks of progressive hikes;</li>
              <li>add back-to-back long walks</li>
              <li>Strength work for legs & core;</li>
              <li>stair sessions</li>
              <li>Pace yourself: pole pole (slowly) conserves energy</li>
            </ul>
          </div>

          {/* Altitude & Health */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <h3 className="text-xl font-bold text-[#F51A43]">Altitude & Health</h3>
            </div>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              <li>Acclimatize by climbing high, sleeping low</li>
              <li>Hydrate well; watch for symptoms; tell your guide early</li>
              <li>Daily checks with oximeter; conservative decision-making</li>
            </ul>
          </div>

          {/* Packing Essentials */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <h3 className="text-xl font-bold text-[#F51A43]">Packing Essentials</h3>
            </div>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              <li>Broken-in boots, camp shoes, trekking poles</li>
              <li>Layering: base, mid, waterproof shell; warm hat & gloves</li>
              <li>0 to -10°C sleeping bag (<span className="text-[#F51A43]">rental available</span>)</li>
              <li>Daypack 25-35L + rain cover; 2-3L hydration</li>
              <li>Headlamp, sunglasses (UV), sunscreen, personal meds, power bank</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-gray-700 font-medium">
            <span className="text-[#F51A43]">Need rentals?</span> Reserve sleeping bags, down jackets, and poles in advance.
          </p>
        </div>

      </div>
    </section>
  );
}
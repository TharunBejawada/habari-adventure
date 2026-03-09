// apps/web/app/page.tsx
import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import BottomCTA from "../components/BottomCTA";
import WhyChooseUs from "../components/WhyChooseUs";
import SafariSection from "../components/SafariSection";
import ClimbingSection from "../components/ClimbingSection";
import HolidayPackages from "../components/HolidayPackages";
import FAQSection from "../components/FAQSection";

export default function HomePage() {
  // const jsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "TouristTrip",
  //   "@id": "https://habariadventure.com/#touristtrip",
  //   "name": "Tanzania Safari Tours & Kilimanjaro Climbing",
  //   "description": "Guided Tanzania safari tours and Kilimanjaro climbing adventures including Serengeti safari and wildlife experiences.",
  //   "touristType": "Adventure Travelers",
  //   "provider": {
  //     "@type": "TravelAgency",
  //     "@id": "https://habariadventure.com/#travelagency",
  //     "name": "Habari Adventure",
  //     "url": "https://habariadventure.com/"
  //   },
  //   "offers": {
  //     "@type": "Offer",
  //     "url": "https://habariadventure.com/",
  //     "priceCurrency": "USD",
  //     "availability": "https://schema.org/InStock"
  //   }
  // };
  return (
    <div className="w-full">
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      /> */}
      <Hero />
      <AboutSection />
      <SafariSection />
      <ClimbingSection />
      <HolidayPackages />
      <WhyChooseUs />
      <FAQSection />
      <BottomCTA />
    </div>
  );
}
// apps/web/app/contact/page.tsx
import ContactHero from "../../components/contact/ContactHero";
import ContactFormSection from "../../components/contact/ContactFormSection";
import ContactLocation from "../../components/contact/ContactLocation"; // <-- Import it here

export default function ContactPage() {
  return (
    <div className="w-full bg-[#FDFEFE]">
      {/* 1. Hero with Animated Clouds & Balloons */}
      <ContactHero />
      
      {/* 2. Split Layout: Contact Cards & Quote Form */}
      <ContactFormSection />
      
      {/* 3. Office Map & Privacy Line */}
      <ContactLocation />
    </div>
  );
}
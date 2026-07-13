// apps/web/app/contact/page.tsx
import ContactHero from "../../../components/contact/ContactHero";
import ContactFormSection from "../../../components/contact/ContactFormSection";
import ContactLocation from "../../../components/contact/ContactLocation";
import FaqSection from "../../../components/common/FaqSection";

const contactFaqs = [
  { question: "How quickly will Habari Adventure respond to my enquiry?", answer: "We aim to respond to all enquiries within 24 hours, often within a few hours during East African business hours (GMT+3)." },
  { question: "Can I build a custom Tanzania Kilimanjaro safari and Zanzibar package?", answer: "Absolutely. Custom combined packages are our speciality. Share your dates, group size, and interests and we'll build a tailored itinerary for you." },
  { question: "Is WhatsApp the fastest way to reach Habari Adventure?", answer: "For quick questions, yes — WhatsApp often gets the fastest response. For detailed itinerary enquiries, the contact form or email ensures we capture all the details we need." },
  { question: "Do you have an office I can visit in Tanzania?", answer: "Yes. Our office is in Moshi, Tanzania. Walk-ins are welcome, and we can arrange a meeting before your departure date." },
  { question: "Can I book directly with Habari Adventure or do I need a travel agent?", answer: "You can book directly with us — no travel agent is needed. Direct bookings ensure the best rates and direct communication with your guide team from day one." }
];

export default function ContactPage() {
  return (
    <div className="w-full bg-[#FDFEFE]">
      {/* 1. Hero with Animated Clouds & Balloons */}
      <ContactHero />
      
      {/* 2. Split Layout: Contact Cards & Quote Form */}
      <ContactFormSection />
      
      {/* 3. Office Map & Privacy Line */}
      <ContactLocation />

      <FaqSection faqs={contactFaqs} />
    </div>
  );
}
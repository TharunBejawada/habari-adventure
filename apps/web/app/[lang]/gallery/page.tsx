// apps/web/app/gallery/page.tsx
import GalleryHero from "../../../components/gallery/GalleryHero";
import GalleryComponent from "../../../components/gallery/GalleryComponent";
import FaqSection from "../../../components/common/FaqSection";

const galleryFaqs = [
  { question: "Can I see photos from specific Kilimanjaro routes in the gallery?", answer: "Yes. Use the filter to browse route-specific imagery from Lemosho, Machame, Rongai, and other routes we operate." },
  { question: "Are the gallery images from real Habari Adventure expeditions?", answer: "Yes, all images are from actual client trips and guide-led expeditions — not stock photography." },
  { question: "Can I submit my own photos from a Habari Adventure trip?", answer: "Absolutely. We welcome and encourage clients to share their images. Contact us after your trip and we'll feature the best submissions in our gallery and on social media." },
  { question: "Do you have video content from Kilimanjaro summits?", answer: "Yes, we share summit and safari video content on our gallery page and social media channels. Check our YouTube and Instagram for the latest footage." },
  { question: "How often is the gallery updated?", answer: "We add new images from the field monthly. Follow us on Instagram for the most current expedition content." }
];

export default function ContactPage() {
  return (
    <div className="w-full bg-[#FDFEFE]">
      <GalleryHero />
      <GalleryComponent />
      <FaqSection faqs={galleryFaqs} />
    </div>
  );
}
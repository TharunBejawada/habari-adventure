// apps/web/app/gallery/page.tsx
import GalleryHero from "../../../components/gallery/GalleryHero";
import GalleryComponent from "../../../components/gallery/GalleryComponent";

export default function ContactPage() {
  return (
    <div className="w-full bg-[#FDFEFE]">
      <GalleryHero />
      <GalleryComponent />
    </div>
  );
}
import type { Metadata } from "next";
import { buildFaqJsonLd } from "../../../lib/seo";

const pageFaqs = [
  {
    question: "Can I see photos from specific Kilimanjaro routes in the gallery?",
    answer: "Yes. Use the filter to browse route-specific imagery from Lemosho, Machame, Rongai, and other routes we operate."
  },
  {
    question: "Are the gallery images from real Habari Adventure expeditions?",
    answer: "Yes, all images are from actual client trips and guide-led expeditions — not stock photography."
  },
  {
    question: "Can I submit my own photos from a Habari Adventure trip?",
    answer: "Absolutely. We welcome and encourage clients to share their images. Contact us after your trip and we'll feature the best submissions in our gallery and on social media."
  },
  {
    question: "Do you have video content from Kilimanjaro summits?",
    answer: "Yes, we share summit and safari video content on our gallery page and social media channels. Check our YouTube and Instagram for the latest footage."
  },
  {
    question: "How often is the gallery updated?",
    answer: "We add new images from the field monthly. Follow us on Instagram for the most current expedition content."
  }
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const canonical = `${siteUrl}/${lang}/gallery`;

  return {
    title: "Habari Adventure Gallery | Kilimanjaro, Safari & More",
    description: "Browse the Habari Adventure gallery — real images from Kilimanjaro climbs, Tanzania safaris, gorilla treks & Zanzibar. See what your East Africa adventure could look like.",
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: "Habari Adventure Gallery | Kilimanjaro, Safari & More",
      description: "Browse the Habari Adventure gallery — real images from Kilimanjaro climbs, Tanzania safaris, gorilla treks & Zanzibar. See what your East Africa adventure could look like.",
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
    },
    twitter: {
      card: "summary_large_image",
      title: "Habari Adventure Gallery | Kilimanjaro, Safari & More",
      description: "Browse the Habari Adventure gallery — real images from Kilimanjaro climbs, Tanzania safaris, gorilla treks & Zanzibar. See what your East Africa adventure could look like.",
    },
  };
}

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqJsonLd = buildFaqJsonLd(pageFaqs);

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
import type { Metadata } from "next";
import { buildFaqJsonLd } from "../../../lib/seo";

const pageFaqs = [
  {
    question: "How quickly will Habari Adventure respond to my enquiry?",
    answer: "We aim to respond to all enquiries within 24 hours, often within a few hours during East African business hours (GMT+3)."
  },
  {
    question: "Can I build a custom Tanzania Kilimanjaro safari and Zanzibar package?",
    answer: "Absolutely. Custom combined packages are our speciality. Share your dates, group size, and interests and we'll build a tailored itinerary for you."
  },
  {
    question: "Is WhatsApp the fastest way to reach Habari Adventure?",
    answer: "For quick questions, yes — WhatsApp often gets the fastest response. For detailed itinerary enquiries, the contact form or email ensures we capture all the details we need."
  },
  {
    question: "Do you have an office I can visit in Tanzania?",
    answer: "Yes. Our office is in Moshi, Tanzania. Walk-ins are welcome, and we can arrange a meeting before your departure date."
  },
  {
    question: "Can I book directly with Habari Adventure or do I need a travel agent?",
    answer: "You can book directly with us — no travel agent is needed. Direct bookings ensure the best rates and direct communication with your guide team from day one."
  }
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const canonical = `${siteUrl}/${lang}/contact`;

  return {
    title: "Tanzania Kilimanjaro Safari Zanzibar Package | Contact",
    description: "Contact Habari Adventure to plan your Tanzania Kilimanjaro safari and Zanzibar package. Custom itineraries, fast responses & direct guide communication. Get in touch today.",
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: "Tanzania Kilimanjaro Safari Zanzibar Package | Contact",
      description: "Contact Habari Adventure to plan your Tanzania Kilimanjaro safari and Zanzibar package. Custom itineraries, fast responses & direct guide communication. Get in touch today.",
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
    },
    twitter: {
      card: "summary_large_image",
      title: "Tanzania Kilimanjaro Safari Zanzibar Package | Contact",
      description: "Contact Habari Adventure to plan your Tanzania Kilimanjaro safari and Zanzibar package. Custom itineraries, fast responses & direct guide communication. Get in touch today.",
    },
  };
}

export default async function ContactLayout({
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
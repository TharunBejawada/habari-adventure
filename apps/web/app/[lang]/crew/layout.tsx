import type { Metadata } from "next";
import { getLangPrefix } from "../../../lib/languages";
import { buildFaqJsonLd } from "../../../lib/seo";

const pageFaqs = [
  {
    question: "How many years of experience do Habari Adventure guides have?",
    answer: "Our senior guides average over 8 years of guiding experience on Kilimanjaro and/or Tanzania safari circuits, with ongoing annual training."
  },
  {
    question: "Are Habari Adventure guides certified?",
    answer: "Yes. All Kilimanjaro guides are KINAPA-certified. Safari guides hold Tanzania Wildlife Authority credentials. All crew complete annual wilderness first aid training."
  },
  {
    question: "How many porters are assigned per climber?",
    answer: "We follow KINAPA guidelines and assign sufficient porters to ensure no individual carries more than the regulated 20 kg limit. Our standard crew includes guide, assistant guide, cook, and 3–5 porters per 2 climbers."
  },
  {
    question: "Does Habari Adventure pay porters fairly?",
    answer: "Yes. We pay above the KINAPA minimum porter wage, provide all required personal equipment, and operate a crew welfare fund for medical emergencies and education support."
  },
  {
    question: "Can I request a specific guide for my Kilimanjaro or safari trip?",
    answer: "Where possible, we accommodate specific guide requests, especially for repeat clients. Contact us directly after reviewing guide profiles to make a preference."
  }
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const canonical = `${siteUrl}${getLangPrefix(lang)}/crew`;

  return {
    title: "Habari Adventure Crew | Guides, Porters & Specialists",
    description: "Meet the certified guides, porters & safari specialists behind Habari Adventure. Experienced, trained & fairly treated — the people who make your East Africa adventure exceptional.",
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: "Habari Adventure Crew | Guides, Porters & Specialists",
      description: "Meet the certified guides, porters & safari specialists behind Habari Adventure. Experienced, trained & fairly treated — the people who make your East Africa adventure exceptional.",
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
    },
    twitter: {
      card: "summary_large_image",
      title: "Habari Adventure Crew | Guides, Porters & Specialists",
      description: "Meet the certified guides, porters & safari specialists behind Habari Adventure. Experienced, trained & fairly treated — the people who make your East Africa adventure exceptional.",
    },
  };
}

export default async function CrewLayout({
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
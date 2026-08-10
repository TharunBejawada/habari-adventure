import type { Metadata } from "next";
import { getLangPrefix } from "../../../lib/languages";
import { buildFaqJsonLd } from "../../../lib/seo";

const pageFaqs = [
  {
    question: "Where is Habari Adventure based?",
    answer: "We are based in Moshi, Tanzania, at the foot of Kilimanjaro — the ideal hub for both mountain expeditions and northern Tanzania safari operations."
  },
  {
    question: "How long has Habari Adventure been operating?",
    answer: "Habari Adventure has been guiding Tanzania safaris and Kilimanjaro climbs for over a decade, building an experienced team of certified guides and field specialists."
  },
  {
    question: "Are Habari Adventure guides certified?",
    answer: "Yes. All Kilimanjaro guides hold KINAPA certification. Our safari guides hold relevant Tanzanian Wildlife Authority credentials and complete regular first-aid and CPR training."
  },
  {
    question: "Is Habari Adventure a responsible tourism operator?",
    answer: "We are committed to responsible travel. We cap group sizes, work with conservation-aligned camps and lodges, and contribute to community and wildlife protection funds."
  },
  {
    question: "Can I speak to a guide before booking?",
    answer: "Yes. We encourage all potential clients to have a direct conversation with our team before booking to ensure the experience we design is the right fit for them."
  }
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const canonical = `${siteUrl}${getLangPrefix(lang)}/about`;

  return {
    title: "Tanzania Safari Experts | About Habari Adventure",
    description: "Meet the team behind Habari Adventure — certified Tanzania safari guides and Kilimanjaro specialists committed to safe, responsible, and unforgettable East Africa expeditions.",
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: "Tanzania Safari Experts | About Habari Adventure",
      description: "Meet the team behind Habari Adventure — certified Tanzania safari guides and Kilimanjaro specialists committed to safe, responsible, and unforgettable East Africa expeditions.",
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
    },
    twitter: {
      card: "summary_large_image",
      title: "Tanzania Safari Experts | About Habari Adventure",
      description: "Meet the team behind Habari Adventure — certified Tanzania safari guides and Kilimanjaro specialists committed to safe, responsible, and unforgettable East Africa expeditions.",
    },
  };
}

export default async function AboutLayout({
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
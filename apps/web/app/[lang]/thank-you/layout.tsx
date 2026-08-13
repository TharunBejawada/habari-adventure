import type { Metadata } from "next";
import { getLangPrefix } from "../../../lib/languages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://habariadventure.com").replace(/\/$/, "");
  const canonical = `${siteUrl}${getLangPrefix(lang)}/thank-you`;

  return {
    title: "Thank You | Habari Adventure",
    description: "Thanks for reaching out to Habari Adventure. Our team will get back to you shortly.",
    alternates: { canonical },
    robots: "index, follow",
    openGraph: {
      title: "Thank You | Habari Adventure",
      description: "Thanks for reaching out to Habari Adventure. Our team will get back to you shortly.",
      url: canonical,
      type: "website",
      siteName: "Habari Adventure",
    },
  };
}

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

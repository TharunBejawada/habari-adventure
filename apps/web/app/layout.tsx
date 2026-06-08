import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GoogleTranslateProvider from "../components/GoogleTranslateProvider";
import { SettingsProvider } from "../context/SettingsContext";
import { Caveat } from "next/font/google";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const caveat = Caveat({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Habari Adventure | Tanzania Safari Packages",
  description: "Explore unforgettable Tanzania safaris with Habari Adventure. Discover wildlife, breathtaking landscapes, and personalized safari packages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* NEW: Google Tag Manager - Script */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TRFGRQKM');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
        {/* NEW: Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-TRFGRQKM"
            height="0" 
            width="0" 
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <GoogleTranslateProvider>
        <SettingsProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </SettingsProvider>
        </GoogleTranslateProvider>
      </body>
    </html>
  );
}

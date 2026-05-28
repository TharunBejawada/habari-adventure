import type { Metadata } from "next";
import localFont from "next/font/local";
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}>
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

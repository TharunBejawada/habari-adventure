// apps/web/components/Footer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface LinkItem { name: string; url: string; }
interface FooterColumn { title: string; links: LinkItem[]; }

const getSocialIcon = (name: string) => {
  const normalized = name.toLowerCase();
  
  if (normalized.includes("facebook") || normalized.includes("fb")) {
    return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>;
  }
  if (normalized.includes("instagram") || normalized.includes("ig")) {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
  }
  if (normalized.includes("twitter") || normalized.includes("x")) {
    return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
  }
  if (normalized.includes("pinterest") || normalized.includes("pin")) {
    return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.981 7.436 6.953 0 4.156-2.617 7.502-6.252 7.502-1.221 0-2.369-.634-2.763-1.383l-.752 2.869c-.272 1.038-1.011 2.339-1.505 3.132 1.157.348 2.388.536 3.654.536 6.623 0 11.985-5.365 11.985-11.987C23.97 5.367 18.633 0 12.017 0z"/></svg>;
  }
  if (normalized.includes("linkedin")) {
    return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
  }
  
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
};

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`)
        .then(res => res.json())
        .then(data => {
          if (data?.data) {
            setSettings({
              ...data.data,
              socialLinks: typeof data.data.socialLinks === 'string' ? JSON.parse(data.data.socialLinks) : data.data.socialLinks,
              footerColumns: typeof data.data.footerColumns === 'string' ? JSON.parse(data.data.footerColumns) : data.data.footerColumns,
            });
          }
        })
        .catch(err => console.error("Failed to fetch footer settings", err));
    }
  }, [pathname]);

  if (pathname && pathname.startsWith("/admin")) return null;
  if (!settings) return null;

  return (
    <footer className="bg-[#FEF9F0] text-[#135D66] pt-12 lg:pt-20 pb-12 px-6 sm:px-8 relative overflow-visible mt-32 lg:mt-40 border-t-2 border-[#135D66]">
      
      {/* --- CAR ANIMATION STYLES --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes driveRight {
            0% { transform: translateX(-300px); }
            100% { transform: translateX(100vw); }
          }
          .animate-car-drive {
            animation: driveRight 20s linear infinite;
          }
        `
      }} />

      {/* --- TOP BORDER GRAPHICS (Car & Tree) --- */}
      <div className="absolute top-0 left-0 w-full h-[135px] -translate-y-[calc(100%+2px)] pointer-events-none z-10 flex items-end">
        
        {/* Right Epic Tree */}
        <div className="absolute bottom-0 right-1 sm:right-3 lg:right-6 z-20">
          <img 
            // Note: Change this src to your actual tree image filename!
            src="/Righttreepic.png" 
            alt="Scenic Tree" 
            className="w-32 sm:w-48 lg:w-64 object-contain origin-bottom"
            loading="lazy" 
          />
        </div>

        {/* Animated Car Container */}
        {/* The z-30 makes the car drive IN FRONT of the tree. Change to z-10 to drive behind it. */}
        <div className="w-full h-full overflow-hidden absolute inset-0 z-30">
          {/* Responsive scale applied here (scale-75 on mobile) */}
          <div className="animate-car-drive relative w-[248px] h-[135px] scale-75 sm:scale-100 origin-bottom-left">
            {/* Car Body */}
            <img 
              className="absolute left-0 bottom-0 h-full w-full object-contain" 
              src="/Left-Car.png" 
              alt="Travlla Safari Car" 
              loading="lazy" 
            />
            {/* Back Tire (Wobble Fix applied via origin-center and flex container) */}
            <span className="absolute left-[11.1%] bottom-0 w-[43px] h-[43px] flex items-center justify-center">
              <img 
                src="/Left-Car-tyre.png" 
                alt="spinning tyre" 
                className="animate-spin w-full h-full object-contain origin-center" 
                loading="lazy" 
              />
            </span>
            {/* Front Tire (Wobble Fix applied) */}
            <span className="absolute right-[10.8%] bottom-0 w-[43px] h-[43px] flex items-center justify-center">
              <img 
                src="/Left-Car-tyre.png" 
                alt="spinning tyre" 
                className="animate-spin w-full h-full object-contain origin-center" 
                loading="lazy" 
              />
            </span>
          </div>
        </div>
      </div>

      {/* --- FOOTER CONTENT --- */}
      <div className="max-w-[1400px] mx-auto w-full lg:w-[96%] flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 relative z-10">
        
        {/* LEFT COLUMN: Logo, Info, and Socials */}
        <div className="w-full lg:w-[28%] space-y-6">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Travlla Logo" 
              width={300} 
              height={120} 
              className="object-contain max-h-32 w-auto"
              priority
            />
          </Link>
          
          <p className="text-sm leading-relaxed font-medium text-[#135D66]/80 lg:pr-4">
            {settings.websiteInfo || "Travlla is a multi-award-winning strategy and content creation agency that specializes in travel marketing."}
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            {settings.socialLinks?.map((social: LinkItem, idx: number) => (
              <a 
                key={idx} 
                href={social.url} 
                target="_blank" 
                rel="noreferrer" 
                title={social.name}
                className="w-10 h-10 rounded-full bg-[#135D66] border-2 border-[#E59A1D] flex items-center justify-center text-white hover:bg-[#E59A1D] hover:border-[#135D66] hover:-translate-y-1 transition-all duration-300"
              >
                {getSocialIcon(social.name)}
              </a>
            ))}
          </div>
        </div>

        {/* MIDDLE COLUMNS: Dynamic CMS Columns */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-around gap-8 lg:gap-6">
          {settings.footerColumns?.map((col: FooterColumn, cIdx: number) => (
            <div key={cIdx} className="space-y-4 lg:space-y-6">
              <h4 className="font-bold text-lg">{col.title}</h4>
              <ul className="space-y-2 lg:space-y-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.url} className="text-sm font-medium text-[#135D66]/80 hover:text-[#98D80D] transition-colors inline-block py-1 lg:py-0">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Contact Info */}
        <div className="w-full lg:w-[25%] space-y-4 lg:space-y-6 pt-4 lg:pt-0 border-t border-[#135D66]/10 lg:border-t-0">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEF] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <span className="font-bold italic text-lg">{settings.phoneNumber}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEF] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
            </div>
            <span className="font-medium text-sm text-[#135D66]/80 break-all">{settings.email}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8EFEF] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <span className="font-medium text-sm leading-relaxed text-[#135D66]/80">{settings.address}</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
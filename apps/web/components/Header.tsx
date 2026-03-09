// apps/web/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeaderSubItem { name: string; url: string; }
interface HeaderItem { name: string; url: string; subItems: HeaderSubItem[]; }

export default function Header() {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<HeaderItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<number | null>(null);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`)
        .then(res => res.json())
        .then(data => {
          if (data?.data?.headerMenu) {
            setMenuItems(typeof data.data.headerMenu === 'string' ? JSON.parse(data.data.headerMenu) : data.data.headerMenu);
          }
        })
        .catch(err => console.error("Failed to fetch header menu", err));
    }
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  if (pathname && pathname.startsWith("/admin")) return null;

  return (

    <div className="w-full px-4 pt-4 pb-2 sticky top-0 z-[100] backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
      
      <header className="w-[96%] max-w-[1400px] mx-auto bg-[#135D66] text-white rounded-2xl px-6 md:px-10 py-5 md:py-6 flex items-center justify-between shadow-xl">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-white.png" 
            alt="Habari Adventure Logo" 
            width={200} 
            height={80} 
            className="object-contain max-h-14 w-auto transition-transform duration-300 hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12 font-medium">
          {menuItems.map((item, index) => (
            <div key={index} className="relative group">
              <Link href={item.url} className="hover:text-[#98D80D] transition-colors py-2 flex items-center gap-1">
                {item.name}
                {item.subItems && item.subItems.length > 0 && (
                  <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              
              {/* Animated Desktop Dropdown */}
              {item.subItems && item.subItems.length > 0 && (
                <div className="absolute top-full left-0 mt-4 w-56 bg-white text-[#135D66] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:mt-2 transition-all duration-300 ease-out border border-gray-100 overflow-hidden">
                  {item.subItems.map((sub, sIndex) => (
                    <Link key={sIndex} href={sub.url} className="block px-5 py-3 hover:bg-gray-50 hover:text-[#98D80D] hover:pl-7 transition-all duration-200 border-b border-gray-50 last:border-0 font-medium">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side Icons & Mobile Hamburger */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="hover:text-[#98D80D] transition-colors hover:scale-110 transform duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <button 
            className="lg:hidden hover:text-[#98D80D] transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-[#135D66] text-white z-[70] lg:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Image src="/logo-white.png" alt="Habari Adventure Logo" width={120} height={40} className="object-contain" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <div key={index} className="px-6 border-b border-white/5 last:border-0">
              
              {item.subItems && item.subItems.length > 0 ? (
                <button 
                  onClick={() => setExpandedMobileItem(expandedMobileItem === index ? null : index)}
                  className="w-full flex items-center justify-between py-4 font-medium text-left hover:text-[#98D80D] transition-colors"
                >
                  {item.name}
                  <svg className={`w-5 h-5 transform transition-transform duration-300 ${expandedMobileItem === index ? "rotate-180 text-[#98D80D]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : (
                <Link 
                  href={item.url} 
                  className="block py-4 font-medium hover:text-[#98D80D] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )}

              {item.subItems && item.subItems.length > 0 && (
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobileItem === index ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}
                >
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-white/20">
                    {item.subItems.map((sub, sIndex) => (
                      <Link 
                        key={sIndex} 
                        href={sub.url} 
                        className="text-white/80 hover:text-[#98D80D] transition-colors py-1"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
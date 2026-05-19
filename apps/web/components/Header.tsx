// apps/web/components/Header.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "./LanguageSwitcher";
import { useLocalizedUrl } from "../hooks/useLocalizedUrl";
import { useSettings } from "../context/SettingsContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderSubItem { name: string; url: string; }
interface HeaderItem    { name: string; url: string; subItems: HeaderSubItem[]; }

// NavConfigItem — mirrors the shape saved by the admin menu builder
interface SubItemOverride {
  slug:   string;
  title:  string;
  url:    string;
  hidden: boolean;
}
interface NavConfigItem {
  id?:    string;
  type?:  "category" | "custom";
  order?: number;
  // category
  reference?:        string;
  label?:            string;
  autoPopulate?:     boolean;
  subItemOverrides?: SubItemOverride[];
  // custom / legacy
  name?:     string;
  url?:      string;
  subItems?: { id?: string; name: string; url: string }[];
}

// Navigation API response
interface NavItem     { title: string; slug: string; }
interface NavCategory { category: string; slug: string; items: NavItem[]; }

// ─── Build flat HeaderItem[] from typed config + live nav data ────────────────

/**
 * Converts the admin NavConfigItem[] + the live NavCategory[] from /navigation
 * into the flat HeaderItem[] that the JSX below renders.
 *
 * - type = "category": sub-items come from matching NavCategory, filtered/
 *   ordered/overridden by subItemOverrides. Category header url = "#".
 * - type = "custom" or legacy (no type): rendered as-is.
 * - Category with zero visible sub-items is omitted.
 */
function buildMenuItems(
  config:  NavConfigItem[],
  navCats: NavCategory[],
): HeaderItem[] {
  return [...config]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap(item => {
      if (item.type === "category") {
        const cat = navCats.find(c => c.category === item.reference);
        if (!cat) return [];

        const overrides    = item.subItemOverrides ?? [];
        const overrideMap  = new Map(overrides.map(o => [o.slug, o]));
        const dbSlugs      = new Set(cat.items.map(i => i.slug));
        const autoPopulate = item.autoPopulate !== false;

        const orderedSlugs: string[] = autoPopulate
          ? [
              ...overrides.map(o => o.slug).filter(s => dbSlugs.has(s)),
              ...cat.items.map(i => i.slug).filter(s => !overrideMap.has(s)),
            ]
          : overrides.map(o => o.slug).filter(s => dbSlugs.has(s));

        const seen     = new Set<string>();
        const subItems: HeaderSubItem[] = [];

        for (const slug of orderedSlugs) {
          if (seen.has(slug)) continue;
          seen.add(slug);
          const ov = overrideMap.get(slug);
          if (ov?.hidden) continue;
          const dbItem = cat.items.find(i => i.slug === slug);
          if (!dbItem) continue;
          subItems.push({
            name: ov?.title?.trim() || dbItem.title,
            url:  ov?.url?.trim()   || `/${dbItem.slug}`,
          });
        }

        if (subItems.length === 0) return [];

        return [{
          name:     item.label?.trim() || item.reference || "",
          url:      "#",   // category parent is a dropdown trigger, not a page
          subItems,
        }];
      }

      // Custom item OR legacy format (no type field)
      return [{
        name:     item.name     ?? "",
        url:      item.url      ?? "#",
        subItems: (item.subItems ?? []).map(s => ({ name: s.name, url: s.url || "#" })),
      }];
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname            = usePathname();
  const { getLocalizedUrl } = useLocalizedUrl();
  const { settings, navCategories } = useSettings();

  const rawConfig: NavConfigItem[] = (settings?.headerMenu as NavConfigItem[]) ?? [];
  const navCats: NavCategory[]     = navCategories;

  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<number | null>(null);
  const [isScrolled,         setIsScrolled]         = useState(false);

  // Derive rendered menu from config + live nav data
  const menuItems: HeaderItem[] = useMemo(
    () => buildMenuItems(rawConfig, navCats),
    [rawConfig, navCats],
  );

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  // Scroll styling
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="w-full px-4 pb-2 sticky top-0 z-[100]">

      <header className={`w-full mx-auto text-white rounded-b-2xl px-6 md:px-10 flex items-center justify-between transition-all duration-500 ${
        isScrolled
          ? "bg-[#135D66] shadow-xl py-3 md:py-4"
          // : "bg-black/30 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/20 py-4 md:py-5"
          : "py-4 md:py-5"
      }`}>

        {/* Logo */}
        <Link href={getLocalizedUrl("/")} className="flex items-center shrink-0">
          <Image
            src="/logo-white.png" alt="Habari Adventure Logo"
            width={200} height={80}
            className="object-contain h-auto w-[150px] transition-transform duration-300 hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-4 lg:gap-5 xl:gap-8 font-medium px-4 text-sm xl:text-base">
          {menuItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.url === "#" ? (
                // Dropdown trigger — no page to navigate to
                <button
                  type="button"
                  className="transition-colors py-2 flex items-center gap-1 text-center"
                >
                  {item.name}
                  {item.subItems.length > 0 && (
                    <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href={getLocalizedUrl(item.url)}
                  className="transition-colors py-2 flex items-center gap-1 text-center"
                >
                  {item.name}
                  {item.subItems.length > 0 && (
                    <svg className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
              )}

              {/* Desktop dropdown */}
              {item.subItems.length > 0 && (
                <div className="absolute top-full left-0 mt-4 w-max bg-white text-[#135D66] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:mt-2 transition-all duration-300 ease-out border border-gray-100 overflow-hidden text-left text-base">
                  {item.subItems.map((sub, sIndex) => (
                    <Link
                      key={sIndex}
                      href={getLocalizedUrl(sub.url)}
                      className="block px-5 py-3 hover:bg-gray-50 hover:pl-7 transition-all duration-200 border-b border-gray-50 last:border-0 font-medium"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right: language + search + hamburger */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0 z-10">
          <LanguageSwitcher />
          {/* <button className="hidden sm:block hover:text-[#fe6e00] transition-colors hover:scale-110 transform duration-200 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button> */}
          <button
            className="lg:hidden hover:text-[#fe6e00] transition-colors p-1 shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile side drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-[#135D66] text-white z-[70] lg:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>

        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Image src="/logo-white.png" alt="Habari Adventure Logo" width={120} height={40} className="object-contain" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <div key={index} className="px-6 border-b border-white/5 last:border-0">

              {/* Items with sub-items always show as accordion trigger */}
              {item.subItems.length > 0 ? (
                <button
                  onClick={() => setExpandedMobileItem(expandedMobileItem === index ? null : index)}
                  className="w-full flex items-center justify-between py-4 font-medium text-left hover:text-[#fe6e00] transition-colors"
                >
                  {item.name}
                  <svg className={`w-5 h-5 transform transition-transform duration-300 ${expandedMobileItem === index ? "rotate-180 text-[#fe6e00]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : item.url === "#" ? (
                // Dropdown trigger with no sub-items (edge case) — plain text
                <span className="block py-4 font-medium">{item.name}</span>
              ) : (
                <Link
                  href={getLocalizedUrl(item.url)}
                  className="block py-4 font-medium hover:text-[#fe6e00] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )}

              {item.subItems.length > 0 && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobileItem === index ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-white/20">
                    {item.subItems.map((sub, sIndex) => (
                      <Link
                        key={sIndex}
                        href={getLocalizedUrl(sub.url)}
                        className="text-white/80 hover:text-[#fe6e00] transition-colors py-1"
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

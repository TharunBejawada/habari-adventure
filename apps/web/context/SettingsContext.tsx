// apps/web/context/SettingsContext.tsx
// Single fetch point for /settings and /navigation.
// Wrap the app with <SettingsProvider> once; consume with useSettings().
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export interface LinkItem     { name: string; url: string; }
export interface FooterColumn { title: string; links: LinkItem[]; }
export interface NavItem      { title: string; slug: string; }
export interface NavCategory  { category: string; slug: string; items: NavItem[]; }

export interface SiteSettings {
  id?: string;
  headerMenu: any[];
  socialLinks: LinkItem[];
  footerColumns: FooterColumn[];
  websiteInfo?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  updatedAt?: string;
}

interface ContextValue {
  settings: SiteSettings | null;
  navCategories: NavCategory[];
  isLoading: boolean;
}

const SettingsContext = createContext<ContextValue>({
  settings: null,
  navCategories: [],
  isLoading: true,
});

function parseJson<T>(value: T | string, fallback: T): T {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings]           = useState<SiteSettings | null>(null);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/settings"),
      apiFetch("/navigation"),
    ])
      .then(([settingsResult, navResult]) => {
        if (settingsResult.ok && settingsResult.data) {
          const d = settingsResult.data;
          setSettings({
            ...d,
            headerMenu:    parseJson(d.headerMenu,    []),
            socialLinks:   parseJson(d.socialLinks,   []),
            footerColumns: parseJson(d.footerColumns, []),
          });
        }
        if (navResult.ok && Array.isArray(navResult.data)) {
          setNavCategories(navResult.data);
        }
      })
      .catch(err => console.error("[SettingsProvider] fetch error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, navCategories, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

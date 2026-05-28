// apps/web/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MenuBuilder from "./components/menu-builder/MenuBuilder";
import {
  type FooterColumn,
  type LinkItem,
  type MenuTreeCategory,
  type NavConfigItem,
  migrateMenu,
  normalizeForSave,
  parseJson,
} from "../../../lib/menuBuilder";

// ─── Social links builder (footer) ───────────────────────────────────────────

const SocialLinksBuilder = ({ list, setter }: { list: LinkItem[]; setter: (l: LinkItem[]) => void }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Social Media Links</h3>
      <button type="button" onClick={() => setter([...list, { name: "", url: "" }])}
        className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
    </div>
    <div className="space-y-3">
      {list.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="text" placeholder="Platform (e.g. Instagram)"
            className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50  text-sm outline-none"
            value={link.name}
            onChange={e => { const n = [...list]; n[i] = { name: e.target.value, url: n[i]?.url ?? "" }; setter(n); }} />
          <input type="text" placeholder="URL"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50  text-sm outline-none"
            value={link.url}
            onChange={e => { const n = [...list]; n[i] = { name: n[i]?.name ?? "", url: e.target.value }; setter(n); }} />
          <button type="button" onClick={() => setter(list.filter((_, j) => j !== i))}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-xs text-gray-400">No social links added.</p>}
    </div>
  </div>
);

// ─── Main settings page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [message,   setMessage]   = useState({ text: "", type: "" });

  // Footer state
  const [websiteInfo,   setWebsiteInfo]   = useState("");
  const [phoneNumber,   setPhoneNumber]   = useState("");
  const [email,         setEmail]         = useState("");
  const [address,       setAddress]       = useState("");
  const [socialLinks,   setSocialLinks]   = useState<LinkItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);

  // Nav menu state
  const [headerMenu, setHeaderMenu] = useState<NavConfigItem[]>([]);
  const [menuTree,    setMenuTree]    = useState<MenuTreeCategory[]>([]);

  // ── Load settings + menu tree in parallel ─────────────────────────────────
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) { setIsLoading(false); return; }
    const safeJson = async (r: Response) => {
      if (!r.ok) return null;
      try { const t = await r.text(); return t ? JSON.parse(t) : null; } catch { return null; }
    };
    Promise.all([
      fetch(`${base}/settings`).then(safeJson),
      fetch(`${base}/navigation/menu-tree`).then(safeJson),
    ])
      .then(([settingsRes, treeRes]) => {
        if (settingsRes?.status === "success" && settingsRes.data) {
          const s = settingsRes.data;
          setWebsiteInfo(s.websiteInfo   ?? "");
          setPhoneNumber(s.phoneNumber   ?? "");
          setEmail(s.email               ?? "");
          setAddress(s.address           ?? "");
          setSocialLinks(parseJson(s.socialLinks,   []));
          setFooterColumns(parseJson(s.footerColumns, []));
          setHeaderMenu(migrateMenu(parseJson(s.headerMenu, [])));
        }
        if (Array.isArray(treeRes?.data)) {
          setMenuTree(treeRes.data);
        }
      })
      .catch(err => console.error("[SettingsPage] load error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Footer column handlers ─────────────────────────────────────────────────

  // const addFooterColumn = () => setFooterColumns([...footerColumns, { title: "", links: [] }]);
  const addFooterColumn = () => {
  if (footerColumns.length >= 3) {
    alert("You can only add up to 3 footer columns.");
    return;
  }
  setFooterColumns([...footerColumns, { title: "", links: [] }]);
};

  const updateColTitle = (idx: number, title: string) => {
    const n = [...footerColumns];
    if (n[idx]) { n[idx].title = title; setFooterColumns(n); }
  };

  const removeCol = (idx: number) => setFooterColumns(footerColumns.filter((_, i) => i !== idx));

  const addColLink = (ci: number) => {
    const n = [...footerColumns];
    if (n[ci]) { n[ci].links.push({ name: "", url: "" }); setFooterColumns(n); }
  };

  const updateColLink = (ci: number, li: number, field: "name" | "url", val: string) => {
    const n = [...footerColumns];
    if (n[ci] && n[ci].links[li]) { n[ci].links[li][field] = val; setFooterColumns(n); }
  };

  const removeColLink = (ci: number, li: number) => {
    const n = [...footerColumns];
    if (n[ci]) { n[ci].links = n[ci].links.filter((_, i) => i !== li); setFooterColumns(n); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({
          websiteInfo, phoneNumber, email, address, socialLinks, footerColumns,
          headerMenu: normalizeForSave(headerMenu),
        }),
      });
      const data = await res.json();
      setMessage(data.status === "success"
        ? { text: "Settings saved successfully!", type: "success" }
        : { text: data.message || "Failed to save settings.", type: "error" });
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Settings…</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 max-w-6xl mx-auto">

      {/* Back */}
      <Link href="/admin"
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group">
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Content Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage header navigation and footer content.</p>
        </div>
        <button type="submit" disabled={isSaving}
          className="px-6 py-2.5 bg-adventure-600 hover:bg-adventure-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-70 transition-colors">
          {isSaving ? "Saving…" : "Save All Settings"}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === "error"
            ? "bg-red-50 text-red-600 border-red-200"
            : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVIGATION BUILDER                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden max-w-full">
        <div className="mb-5 border-b border-gray-100 dark:border-gray-700 pb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Header Navigation</h3>
          <p className="text-xs text-gray-500 mt-1">
            <strong>Categories</strong> and <strong>Locations</strong>, or <strong>Custom Links</strong> from the left panel.
          </p>
        </div>

        <MenuBuilder
          headerMenu={headerMenu}
          setHeaderMenu={setHeaderMenu}
          menuTree={menuTree}
        />
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER SETTINGS                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Footer Content</h3>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
          <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50  outline-none"
            value={websiteInfo} onChange={e => setWebsiteInfo(e.target.value)} placeholder="Brief description…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50  outline-none"
            value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50  outline-none"
            value={email} onChange={e => setEmail(e.target.value)} placeholder="info@company.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50  outline-none"
            value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St…" />
        </div>
      </div>

      <SocialLinksBuilder list={socialLinks} setter={setSocialLinks} />

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dynamic Footer Columns</h3>
            <p className="text-sm text-gray-500">Add custom link columns (e.g. Services, Legal, Resources).</p>
          </div>
          <button type="button" onClick={addFooterColumn}
  disabled={footerColumns.length >= 3}
  className="px-4 py-2 bg-adventure-100 text-adventure-700 hover:bg-adventure-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg text-sm transition-colors">
  {footerColumns.length >= 3 ? "Limit Reached (3/3)" : "+ Add New Column"}
</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {footerColumns.map((col, ci) => (
            <div key={ci} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
              <button type="button" onClick={() => removeCol(ci)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">
                Remove Column
              </button>
              <div className="mb-4 pr-32">
                <input type="text" placeholder="Column Title (e.g. Explore)"
                  className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-adventure-600 dark:border-gray-600 bg-transparent text-lg font-bold outline-none"
                  value={col.title} onChange={e => updateColTitle(ci, e.target.value)} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => addColLink(ci)}
                    className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
                </div>
                {col.links.map((link, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <input type="text" placeholder="Name"
                      className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50  text-sm outline-none"
                      value={link.name} onChange={e => updateColLink(ci, li, "name", e.target.value)} />
                    <input type="text" placeholder="URL"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50  text-sm outline-none"
                      value={link.url} onChange={e => updateColLink(ci, li, "url", e.target.value)} />
                    <button type="button" onClick={() => removeColLink(ci, li)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {col.links.length === 0 && <p className="text-xs text-gray-400">No links in this column yet.</p>}
              </div>
            </div>
          ))}
        </div>
        {footerColumns.length === 0 && (
          <div className="text-center py-6 text-gray-500">No footer columns created.</div>
        )}
      </div>

    </form>
  );
}

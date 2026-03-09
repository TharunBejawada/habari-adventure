// apps/web/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";

// Types for Strict TypeScript
interface LinkItem { name: string; url: string; }
interface FooterColumn { title: string; links: LinkItem[]; }
interface HeaderSubItem { name: string; url: string; }
interface HeaderItem { name: string; url: string; subItems: HeaderSubItem[]; }

// --- Reusable Logic for the dedicated Social Links ---
const addSocialLink = (setter: any, list: any[]) => setter([...list, { name: "", url: "" }]);
const updateSocialLink = (setter: any, list: any[], index: number, field: keyof LinkItem, value: string) => {
  const newList = [...list];
  if (newList[index]) {
    newList[index][field] = value;
    setter(newList);
  }
};
const removeSocialLink = (setter: any, list: any[], index: number) => setter(list.filter((_, i) => i !== index));

const SocialLinksBuilder = ({ list, setter }: { list: LinkItem[], setter: any }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Social Media Links</h3>
      <button type="button" onClick={() => addSocialLink(setter, list)} className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
    </div>
    <div className="space-y-3">
      {list.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <input type="text" placeholder="Platform (e.g. Instagram)" className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none" value={link.name} onChange={(e) => updateSocialLink(setter, list, index, "name", e.target.value)} />
          <input type="text" placeholder="URL (e.g. https://instagram.com/...)" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none" value={link.url} onChange={(e) => updateSocialLink(setter, list, index, "url", e.target.value)} />
          <button type="button" onClick={() => removeSocialLink(setter, list, index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-xs text-gray-400">No social links added.</p>}
    </div>
  </div>
);

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Basic Info State
  const [websiteInfo, setWebsiteInfo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Links State
  const [socialLinks, setSocialLinks] = useState<LinkItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);
  const [headerMenu, setHeaderMenu] = useState<HeaderItem[]>([]);

  // Fetch Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`);
        const data = await res.json();
        if (data.status === "success" && data.data) {
          const s = data.data;
          setWebsiteInfo(s.websiteInfo || "");
          setPhoneNumber(s.phoneNumber || "");
          setEmail(s.email || "");
          setAddress(s.address || "");
          
          setSocialLinks(typeof s.socialLinks === 'string' ? JSON.parse(s.socialLinks) : s.socialLinks || []);
          setFooterColumns(typeof s.footerColumns === 'string' ? JSON.parse(s.footerColumns) : s.footerColumns || []);
          setHeaderMenu(typeof s.headerMenu === 'string' ? JSON.parse(s.headerMenu) : s.headerMenu || []);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- Header Handlers ---
  const addHeaderItem = () => setHeaderMenu([...headerMenu, { name: "", url: "", subItems: [] }]);
  const updateHeaderItem = (index: number, field: "name"|"url", value: string) => {
    const newMenu = [...headerMenu];
    if (newMenu[index]) { newMenu[index][field] = value; setHeaderMenu(newMenu); }
  };
  const removeHeaderItem = (index: number) => setHeaderMenu(headerMenu.filter((_, i) => i !== index));

  const addSubItem = (headerIndex: number) => {
    const newMenu = [...headerMenu];
    if (newMenu[headerIndex]) { newMenu[headerIndex].subItems.push({ name: "", url: "" }); setHeaderMenu(newMenu); }
  };
  const updateSubItem = (headerIndex: number, subIndex: number, field: "name"|"url", value: string) => {
    const newMenu = [...headerMenu];
    if (newMenu[headerIndex] && newMenu[headerIndex].subItems[subIndex]) {
      newMenu[headerIndex].subItems[subIndex][field] = value;
      setHeaderMenu(newMenu);
    }
  };
  const removeSubItem = (headerIndex: number, subIndex: number) => {
    const newMenu = [...headerMenu];
    if (newMenu[headerIndex]) {
      newMenu[headerIndex].subItems = newMenu[headerIndex].subItems.filter((_, i) => i !== subIndex);
      setHeaderMenu(newMenu);
    }
  };

  // --- Dynamic Footer Column Handlers ---
  const addFooterColumn = () => setFooterColumns([...footerColumns, { title: "", links: [] }]);
  
  const updateFooterColumnTitle = (index: number, title: string) => {
    const newCols = [...footerColumns];
    // FIX: Check if the column exists before updating
    if (newCols[index]) {
      newCols[index].title = title;
      setFooterColumns(newCols);
    }
  };
  
  const removeFooterColumn = (index: number) => setFooterColumns(footerColumns.filter((_, i) => i !== index));

  const addColumnLink = (colIndex: number) => {
    const newCols = [...footerColumns];
    // FIX: Check if the column exists before pushing a link
    if (newCols[colIndex]) {
      newCols[colIndex].links.push({ name: "", url: "" });
      setFooterColumns(newCols);
    }
  };
  
  const updateColumnLink = (colIndex: number, linkIndex: number, field: "name"|"url", value: string) => {
    const newCols = [...footerColumns];
    // FIX: Check if both the column AND the link exist before updating
    if (newCols[colIndex] && newCols[colIndex].links[linkIndex]) {
      newCols[colIndex].links[linkIndex][field] = value;
      setFooterColumns(newCols);
    }
  };
  
  const removeColumnLink = (colIndex: number, linkIndex: number) => {
    const newCols = [...footerColumns];
    // FIX: Check if the column exists before filtering its links
    if (newCols[colIndex]) {
      newCols[colIndex].links = newCols[colIndex].links.filter((_, i) => i !== linkIndex);
      setFooterColumns(newCols);
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        websiteInfo, phoneNumber, email, address,
        socialLinks, footerColumns, headerMenu
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === "success") {
        setMessage({ text: "Settings saved successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to save settings.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Settings...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Content Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage header navigation and footer content.</p>
        </div>
        <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-adventure-600 hover:bg-adventure-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-70 transition-colors">
          {isSaving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} border`}>
          {message.text}
        </div>
      )}

      {/* --- HEADER MENU BUILDER --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Header Navigation</h3>
            <p className="text-xs text-gray-500 mt-1">Build the main top menu. You can add dropdown sub-items to each main item.</p>
          </div>
          <button type="button" onClick={addHeaderItem} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
            + Add Main Menu Item
          </button>
        </div>

        <div className="space-y-4">
          {headerMenu.map((item, hIndex) => (
            <div key={hIndex} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-gray-400">{hIndex + 1}.</span>
                <input type="text" placeholder="Menu Title (e.g. Safari)" className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 outline-none" value={item.name} onChange={(e) => updateHeaderItem(hIndex, "name", e.target.value)} />
                <input type="text" placeholder="URL (e.g. /safari)" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 outline-none" value={item.url} onChange={(e) => updateHeaderItem(hIndex, "url", e.target.value)} />
                <button type="button" onClick={() => removeHeaderItem(hIndex)} className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Remove</button>
              </div>

              <div className="ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dropdown Items</span>
                  <button type="button" onClick={() => addSubItem(hIndex)} className="text-xs font-bold text-adventure-600 hover:text-adventure-800">+ Add Sub-Item</button>
                </div>
                
                {item.subItems.map((subItem, sIndex) => (
                  <div key={sIndex} className="flex items-center gap-2">
                    <input type="text" placeholder="Sub-item name" className="w-1/3 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm outline-none" value={subItem.name} onChange={(e) => updateSubItem(hIndex, sIndex, "name", e.target.value)} />
                    <input type="text" placeholder="URL" className="flex-1 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm outline-none" value={subItem.url} onChange={(e) => updateSubItem(hIndex, sIndex, "url", e.target.value)} />
                    <button type="button" onClick={() => removeSubItem(hIndex, sIndex)} className="p-1.5 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {headerMenu.length === 0 && <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">No header menu items created yet.</div>}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* --- FOOTER SETTINGS --- */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Footer Content</h3>
      
      {/* General Company Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
          <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none" value={websiteInfo} onChange={(e) => setWebsiteInfo(e.target.value)} placeholder="Brief description..."></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@company.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St..." />
        </div>
      </div>

      <SocialLinksBuilder list={socialLinks} setter={setSocialLinks} />

      {/* Dynamic Footer Columns Builder */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dynamic Footer Columns</h3>
            <p className="text-sm text-gray-500">Add custom link columns (e.g. Services, Legal, Resources).</p>
          </div>
          <button type="button" onClick={addFooterColumn} className="px-4 py-2 bg-adventure-100 text-adventure-700 hover:bg-adventure-200 font-medium rounded-lg text-sm transition-colors">
            + Add New Column
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {footerColumns.map((col, colIndex) => (
            <div key={colIndex} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
              <button type="button" onClick={() => removeFooterColumn(colIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">Remove Column</button>
              
              <div className="mb-4 pr-32">
                <input type="text" placeholder="Column Title (e.g. Explore)" className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-adventure-600 dark:border-gray-600 bg-transparent text-lg font-bold outline-none" value={col.title} onChange={(e) => updateFooterColumnTitle(colIndex, e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => addColumnLink(colIndex)} className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
                </div>
                {col.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center gap-2">
                    <input type="text" placeholder="Name" className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none" value={link.name} onChange={(e) => updateColumnLink(colIndex, linkIndex, "name", e.target.value)} />
                    <input type="text" placeholder="URL" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none" value={link.url} onChange={(e) => updateColumnLink(colIndex, linkIndex, "url", e.target.value)} />
                    <button type="button" onClick={() => removeColumnLink(colIndex, linkIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {col.links.length === 0 && <p className="text-xs text-gray-400">No links in this column yet.</p>}
              </div>
            </div>
          ))}
        </div>
        {footerColumns.length === 0 && <div className="text-center py-6 text-gray-500">No footer columns created.</div>}
      </div>

    </form>
  );
}
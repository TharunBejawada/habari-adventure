// apps/web/app/admin/locations/editor/page.tsx
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import { SUPPORTED_LANGUAGES } from "../../../../lib/languages";
import { apiFetch, getAdminToken } from "../../../../lib/apiClient";
import { toSlug } from "../../../../lib/slugify";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

function BasicRTE({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, false] }, 'bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ]
  }), []);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-300 text-gray-900">
      <style dangerouslySetInnerHTML={{__html: `
        .ql-editor { min-height: 150px; color: #111827; }
        .ql-editor.ql-blank::before { color: #9ca3af; }
      `}} />
      <ReactQuill theme="snow" value={value || ""} onChange={onChange} modules={modules} />
    </div>
  );
}

function LocationEditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const isEditMode = !!editSlug;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW: State to track if we should auto-fill the slug
  const [autoSlug, setAutoSlug] = useState(!isEditMode);

  const [activeLang, setActiveLang] = useState('en');
  const [snapshot, setSnapshot] = useState<string>("");

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    category: "", // Global
    bannerImage: "",
    heroImage: "", // Global
    overviewText: "",
    youtubeVideoUrl: "",
    isPublished: false,
    // SEO fields
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    robots: "index, follow",
    structuredData: "",
  });

  useEffect(() => {
    if (isEditMode) {
      apiFetch(`/locations/${encodeURIComponent(editSlug)}`)
        .then(({ ok, data }) => {
          if (ok && data) {
            const p = data;
            setFormData({
              id: p.id || "",
              title: p.title || "",
              slug: p.slug || "",
              category: p.category || "",
              bannerImage: p.bannerImage || "",
              heroImage: p.heroImage || "",
              overviewText: p.overviewText || "",
              youtubeVideoUrl: p.youtubeVideoUrl || "",
              isPublished: p.isPublished || false,
              metaTitle: p.metaTitle || "",
              metaDescription: p.metaDescription || "",
              metaKeywords: p.metaKeywords || "",
              canonicalUrl: p.canonicalUrl || "",
              ogTitle: p.ogTitle || "",
              ogDescription: p.ogDescription || "",
              ogImage: p.ogImage || "",
              twitterTitle: p.twitterTitle || "",
              twitterDescription: p.twitterDescription || "",
              twitterImage: p.twitterImage || "",
              robots: p.robots || "index, follow",
              structuredData: p.structuredData ? JSON.stringify(p.structuredData, null, 2) : "",
            });
            setSnapshot(JSON.stringify({ title: p.title || "", slug: p.slug || "", overviewText: p.overviewText || "" }));
          }
        })
        .catch(err => console.error("Failed to fetch location data", err))
        .finally(() => setIsLoading(false));
    }
  }, [editSlug, isEditMode]);

  // NEW: Auto-generate the slug based on Category and Title if we are creating a new location
  useEffect(() => {
    if (!isEditMode && autoSlug) {
      const catPart = formData.category ? toSlug(formData.category) : '';
      const titlePart = formData.title ? toSlug(formData.title) : '';
      
      const generatedSlug = [catPart, titlePart].filter(Boolean).join('/');
      
      if (formData.slug !== generatedSlug) {
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
      }
    }
  }, [formData.title, formData.category, isEditMode, autoSlug]);

  const handleLanguageSwitch = async (langCode: string) => {
    if (langCode === activeLang) return;
    
    if (!isEditMode) {
      alert("Please save the English location first before adding translations.");
      return;
    }

    setActiveLang(langCode);
    setIsLoading(true);

    try {
      const { ok, data } = await apiFetch(`/locations/${encodeURIComponent(editSlug)}?lang=${langCode}`);

      if (ok && data) {
        const p = data;
        setFormData({
          id: p.id || "",
          title: p.title || "",
          slug: p.slug || "",
          category: p.category || "", // Global
          bannerImage: p.bannerImage || "", // Global
          heroImage: p.heroImage || "", // Global
          overviewText: p.overviewText || "",
          youtubeVideoUrl: p.youtubeVideoUrl || "", // Global
          isPublished: p.isPublished || false, // Global
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
          metaKeywords: p.metaKeywords || "",
          canonicalUrl: p.canonicalUrl || "", // Global
          ogTitle: p.ogTitle || "", // Global
          ogDescription: p.ogDescription || "", // Global
          ogImage: p.ogImage || "", // Global
          twitterTitle: p.twitterTitle || "", // Global
          twitterDescription: p.twitterDescription || "", // Global
          twitterImage: p.twitterImage || "", // Global
          robots: p.robots || "index, follow", // Global
          structuredData: p.structuredData ? JSON.stringify(p.structuredData, null, 2) : "", // Global
        });
        setSnapshot(JSON.stringify({ title: p.title || "", slug: p.slug || "", overviewText: p.overviewText || "" }));
      }
    } catch (err) {
      console.error("Failed to load translation");
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'bannerImage' | 'heroImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("folder", "locations");
    form.append("asset", file);
    try {
      const { ok, data } = await apiFetch("/upload", {
        method: "POST",
        token: getAdminToken(),
        body: form
      });
      if (ok && data) setFormData({ ...formData, [fieldName]: data.url });
    } catch (err) { alert("Upload failed."); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a Category before saving.");
      return;
    }
    setIsSaving(true);
    try {
      // Parse structuredData JSON if provided; ignore if invalid
      let parsedStructuredData: object | null = null;
      if (formData.structuredData?.trim()) {
        try { parsedStructuredData = JSON.parse(formData.structuredData); } catch { /* keep null */ }
      }
      const payload = { ...formData, languageCode: activeLang, structuredData: parsedStructuredData ?? undefined };
      const updateIdentifier = payload.id || editSlug;

      if (!isEditMode) delete (payload as any).id;
      else if (!updateIdentifier) { alert("Missing ID"); setIsSaving(false); return; }

      if (activeLang !== 'en') {
        const currentDataToSave = {
          title: payload.title,
          slug: payload.slug,
          overviewText: payload.overviewText,
          metaTitle: payload.metaTitle,
          metaDescription: payload.metaDescription,
          metaKeywords: payload.metaKeywords,
        };
        if (JSON.stringify(currentDataToSave) === snapshot) {
          alert("No translation changes detected. Save aborted to protect the automatic English fallback.");
          setIsSaving(false);
          return;
        }
      }

      const path = isEditMode
        ? `/locations/${updateIdentifier}`
        : `/locations`;

      const { ok, data, error } = await apiFetch(path, {
        method: isEditMode ? "PUT" : "POST",
        token: getAdminToken(),
        body: JSON.stringify(payload)
      });

      if (ok) {
        if (activeLang === 'en') {
          router.push("/admin/locations");
        } else {
          alert(`${activeLang.toUpperCase()} Translation Saved Successfully!`);
          setSnapshot(JSON.stringify({ title: payload.title, slug: payload.slug, overviewText: payload.overviewText, metaTitle: payload.metaTitle, metaDescription: payload.metaDescription, metaKeywords: payload.metaKeywords }));
        }
      }
      else if (error?.includes("Unique constraint failed")) {
          alert("This URL Slug is already in use by another location!");
      }
      else {
          alert(`Save failed: ${error || "Unknown error"}`);
      }
    } catch (err) { alert("Error saving."); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading Data...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/admin/locations" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3">
         ← Back to Locations
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#135D66]">
          {isEditMode ? "Edit Location" : "Create New Location"}
        </h2>
        
        <div className="flex items-center gap-3">
          {activeLang !== 'en' && isEditMode && (
            <button 
              type="button" 
              onClick={async () => {
                if (!window.confirm(`Are you sure you want to delete the ${activeLang.toUpperCase()} translation?`)) return;
                setIsLoading(true);
                await apiFetch(`/locations/${formData.id}/translations/${activeLang}`, {
                  method: "DELETE",
                  token: getAdminToken()
                });
                alert("Translation deleted. Reloading fallback text...");
                handleLanguageSwitch(activeLang);
              }}
              className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors border border-red-100 text-sm"
            >
              Clear Translation
            </button>
          )}
          <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#E59A1D] hover:bg-[#c98616] text-white font-bold rounded-lg transition-all">
            {isSaving ? "Saving..." : (activeLang !== 'en' ? `Save ${activeLang.toUpperCase()}` : "Save Location")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-b border-gray-200">
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            key={lang.code} type="button" onClick={() => handleLanguageSwitch(lang.code)}
            className={`px-6 py-3 rounded-t-xl font-bold transition-colors border border-b-0 ${
              activeLang === lang.code ? 'bg-[#135D66] text-white border-[#135D66]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{lang.flag}</span> {lang.name}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* ROW 1: Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location Title *</label>
            <input 
              type="text" required placeholder="e.g., Mount Kilimanjaro" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 transition-colors" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            {activeLang === 'en' ? (
             <select 
                required
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors cursor-pointer ${
                  !formData.category ? 'text-gray-400 border-red-300 bg-red-50' : 'text-gray-900 border-gray-300 bg-white focus:border-[#135D66]'
                }`}
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled hidden>Select an option</option>
                <option value="Climbing" className="text-gray-900">Climbing</option>
                <option value="Safari" className="text-gray-900">Safari</option>
                <option value="Destinations" className="text-gray-900">Destinations</option>
                <option value="Day Trips" className="text-gray-900">Day Trips</option>
              </select>
            ) : (
              <div className="text-sm font-bold text-gray-500 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center">
                <span className="mr-2 text-[#E59A1D]">Managed in English Tab:</span> {formData.category}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Slug & Video */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
            <input 
              type="text" required placeholder="e.g., safari/serengeti"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors" 
              value={formData.slug} 
              // Turn off auto-filling the moment the admin types manually into this box
              onChange={e => {
                setAutoSlug(false);
                setFormData({...formData, slug: e.target.value});
              }} 
            />
            <p className="text-xs text-gray-400 mt-1.5 font-medium">Use a full path, e.g. "safari/serengeti" or "climbing/kilimanjaro"</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video URL (Optional)</label>
            {activeLang === 'en' ? (
              <input 
                type="url" placeholder="e.g., https://www.youtube.com/watch?v=..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 transition-colors" 
                value={formData.youtubeVideoUrl} onChange={e => setFormData({...formData, youtubeVideoUrl: e.target.value})} 
              />
            ) : (
              <div className="text-xs font-bold text-[#E59A1D] bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center">
                Video is shared across all languages and managed in the English tab.
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image Upload</label>
            {activeLang === 'en' ? (
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerImage')} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700 bg-white" />
            ) : (
              <div className="text-xs font-bold text-[#E59A1D] bg-orange-50 p-2 rounded-lg">Managed in English Tab</div>
            )}
            {formData.bannerImage && (
              <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={formData.bannerImage} alt="Preview" fill unoptimized className="object-cover" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hero Image Upload</label>
            {activeLang === 'en' ? (
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700 bg-white" />
            ) : (
              <div className="text-xs font-bold text-[#E59A1D] bg-orange-50 p-2 rounded-lg">Managed in English Tab</div>
            )}
            {formData.heroImage && (
              <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={formData.heroImage} alt="Preview" fill unoptimized className="object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">Overview Text *</label>
          <BasicRTE value={formData.overviewText} onChange={(val) => setFormData({...formData, overviewText: val})} />
        </div>

      </div>

      {/* SEO SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-bold text-[#135D66] text-lg">Search Engine Optimization</h3>
          {activeLang !== 'en' && <span className="text-xs font-bold text-[#E59A1D] bg-orange-50 px-2 py-1 rounded">Localized SEO</span>}
        </div>

        {/* Per-language: metaTitle, metaDescription, metaKeywords */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
          <input
            type="text"
            placeholder={`${formData.title || "Location Title"} | Habari Adventure`}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
            value={formData.metaTitle}
            onChange={e => setFormData({...formData, metaTitle: e.target.value})}
          />
          <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate from title.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
          <textarea
            rows={3}
            placeholder="Brief summary shown in Google results (max 160 chars)..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors resize-none"
            value={formData.metaDescription}
            onChange={e => setFormData({...formData, metaDescription: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Meta Keywords</label>
          <input
            type="text"
            placeholder="kilimanjaro, safari, tanzania, climbing"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
            value={formData.metaKeywords}
            onChange={e => setFormData({...formData, metaKeywords: e.target.value})}
          />
        </div>

        {/* English-only: og, twitter, canonical, robots, structuredData */}
        {activeLang === 'en' ? (
          <>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-[#135D66] uppercase tracking-wider mb-4">Open Graph (Social Sharing)</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">OG Title</label>
                  <input type="text" placeholder="Defaults to Meta Title" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={formData.ogTitle} onChange={e => setFormData({...formData, ogTitle: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">OG Description</label>
                  <textarea rows={2} placeholder="Defaults to Meta Description" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none" value={formData.ogDescription} onChange={e => setFormData({...formData, ogDescription: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">OG Image URL</label>
                  <input type="url" placeholder="Defaults to Banner Image" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={formData.ogImage} onChange={e => setFormData({...formData, ogImage: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-[#135D66] uppercase tracking-wider mb-4">Twitter / X Card</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Twitter Title</label>
                  <input type="text" placeholder="Defaults to Meta Title" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={formData.twitterTitle} onChange={e => setFormData({...formData, twitterTitle: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Twitter Description</label>
                  <textarea rows={2} placeholder="Defaults to Meta Description" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none" value={formData.twitterDescription} onChange={e => setFormData({...formData, twitterDescription: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Twitter Image URL</label>
                  <input type="url" placeholder="Defaults to OG Image or Banner Image" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={formData.twitterImage} onChange={e => setFormData({...formData, twitterImage: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-[#135D66] uppercase tracking-wider mb-4">Technical SEO</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Canonical URL</label>
                  <input type="url" placeholder="Leave blank to auto-generate" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={formData.canonicalUrl} onChange={e => setFormData({...formData, canonicalUrl: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Robots Directive</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white" value={formData.robots} onChange={e => setFormData({...formData, robots: e.target.value})}>
                    <option value="index, follow">index, follow (Default — recommended)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Custom Structured Data (JSON-LD)</label>
                  <textarea
                    rows={5}
                    placeholder={`Leave blank to auto-generate TouristDestination schema.\n\nOr paste custom JSON-LD here.`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none font-mono"
                    value={formData.structuredData}
                    onChange={e => setFormData({...formData, structuredData: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 mt-1">Must be valid JSON. Leave blank to auto-generate.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs font-bold text-[#E59A1D] bg-orange-50 p-3 rounded-lg border border-orange-100">
            OG, Twitter, Canonical, Robots, and Structured Data are global and managed in the English tab.
          </div>
        )}
      </div>

      {/* PUBLISHING STATUS WITH CENTERED TOGGLE */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="font-bold text-[#135D66] text-lg border-b border-gray-100 pb-3">Publishing Status</h3>
        
        <label className="flex items-center justify-center p-5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
          {activeLang === 'en' ? (
            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold transition-colors duration-300 ${!formData.isPublished ? 'text-gray-800' : 'text-gray-400'}`}>
                Draft
              </span>
              
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" className="sr-only peer" checked={formData.isPublished} 
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})} 
                />
                <div className="relative w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fe6e00]"></div>
              </div>

              <span className={`text-sm font-bold transition-colors duration-300 ${formData.isPublished ? 'text-[#fe6e00]' : 'text-gray-400'}`}>
                Published
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-[#E59A1D]">Visibility Managed in English Tab</span>
          )}
        </label>
      </div>

    </form>
  );
}

export default function LocationEditorPage() {
  return (
    <div className="min-h-screen py-10">
      <Suspense fallback={<div className="text-center font-bold text-gray-500 pt-20">Loading...</div>}>
        <LocationEditorForm />
      </Suspense>
    </div>
  );
}
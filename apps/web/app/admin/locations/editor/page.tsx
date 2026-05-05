// apps/web/app/admin/locations/editor/page.tsx
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import { SUPPORTED_LANGUAGES } from "../../../../lib/languages";

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
    isPublished: false
  });

  useEffect(() => {
    if (isEditMode) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${encodeURIComponent(editSlug)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success" && data.data) {
            const p = data.data;
            setFormData({
              id: p.id || "",
              title: p.title || "",
              slug: p.slug || "",
              category: p.category || "",
              bannerImage: p.bannerImage || "",
              heroImage: p.heroImage || "",
              overviewText: p.overviewText || "",
              youtubeVideoUrl: p.youtubeVideoUrl || "",
              isPublished: p.isPublished || false
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
      const catPart = formData.category ? formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
      // const titlePart = formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
      const titlePart = formData.title ? formData.title.trim() : '';
      
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${encodeURIComponent(editSlug)}?lang=${langCode}`);
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        const p = data.data;
        setFormData({
          id: p.id || "",
          title: p.title || "",
          slug: p.slug || "",
          category: p.category || "", // Global
          bannerImage: p.bannerImage || "", // Global
          heroImage: p.heroImage || "", // Global
          overviewText: p.overviewText || "",
          youtubeVideoUrl: p.youtubeVideoUrl || "", // Global
          isPublished: p.isPublished || false // Global
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
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
        method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: form
      });
      const data = await res.json();
      if (data.status === "success") setFormData({ ...formData, [fieldName]: data.data.url });
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
      const payload = { ...formData, languageCode: activeLang };
      const updateIdentifier = payload.id || editSlug;

      if (!isEditMode) delete (payload as any).id;
      else if (!updateIdentifier) { alert("Missing ID"); setIsSaving(false); return; }

      if (activeLang !== 'en') {
        const currentDataToSave = { title: payload.title, slug: payload.slug, overviewText: payload.overviewText };
        if (JSON.stringify(currentDataToSave) === snapshot) {
          alert("No translation changes detected. Save aborted to protect the automatic English fallback.");
          setIsSaving(false);
          return;
        }
      }

      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${updateIdentifier}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations`;
        
      const token = localStorage.getItem("adminToken");
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.status === "success") {
        if (activeLang === 'en') {
          router.push("/admin/locations");
        } else {
          alert(`${activeLang.toUpperCase()} Translation Saved Successfully!`);
          setSnapshot(JSON.stringify({ title: payload.title, slug: payload.slug, overviewText: payload.overviewText }));
        }
      }
      else if (data.message?.includes("Unique constraint failed")) {
          alert("This URL Slug is already in use by another location!");
      } 
      else {
          alert(`Save failed: ${data.message || "Unknown error"}`);
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
                const token = localStorage.getItem("adminToken");
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${formData.id}/translations/${activeLang}`, {
                  method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
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
                <div className="relative w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#98D80D]"></div>
              </div>

              <span className={`text-sm font-bold transition-colors duration-300 ${formData.isPublished ? 'text-[#98D80D]' : 'text-gray-400'}`}>
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
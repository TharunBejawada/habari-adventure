"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

// Reusing your Quill setup
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

// Simplified RTE just for overview text
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

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    bannerImage: "",
    overviewText: "",
    youtubeVideoUrl: "",
    isPublished: false
  });

  useEffect(() => {
    if (isEditMode) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${editSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success" && data.data) {
            // Added fallbacks (|| "") to ensure React inputs are controlled properly
            // even if the database returns null for optional fields.
            setFormData({
              id: data.data.id || "",
              title: data.data.title || "",
              slug: data.data.slug || "",
              bannerImage: data.data.bannerImage || "",
              overviewText: data.data.overviewText || "",
              youtubeVideoUrl: data.data.youtubeVideoUrl || "",
              isPublished: data.data.isPublished || false
            });
          }
        })
        .catch(err => console.error("Failed to fetch location data", err))
        .finally(() => setIsLoading(false));
    }
  }, [editSlug, isEditMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (data.status === "success") setFormData({ ...formData, bannerImage: data.data.url });
    } catch (err) { alert("Upload failed."); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      const updateIdentifier = payload.id || editSlug;

      if (!isEditMode) delete (payload as any).id;
      else if (!updateIdentifier) { alert("Missing ID"); setIsSaving(false); return; }

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
      if (data.status === "success") router.push("/admin/locations");
      else if (data.message?.includes("slug")) alert("Slug already in use!");
      else alert("Save failed.");
    } catch (err) { alert("Error saving."); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="p-10 text-center font-bold">Loading Data...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/admin/locations" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3">
         ← Back to Locations
      </Link>
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#135D66]">
          {isEditMode ? "Edit Location" : "Create New Location"}
        </h2>
        <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#E59A1D] hover:bg-[#c98616] text-white font-bold rounded-lg transition-all">
          {isSaving ? "Saving..." : "Save Location"}
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location Title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g., Mount Kilimanjaro" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 transition-colors" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          {/* UPDATED SLUG FIELD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
            <div className="flex items-stretch">
              <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm font-medium flex items-center">
                /destinations/
              </span>
              <input 
                type="text" 
                required 
                placeholder="mount-kilimanjaro"
                className="w-full px-4 py-3 border border-gray-300 rounded-r-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors" 
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image Upload</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="w-full border border-gray-300 p-2 rounded-xl text-gray-700 bg-white" 
            />
            {formData.bannerImage && (
              <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={formData.bannerImage} alt="Preview" fill unoptimized className="object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">YouTube Video URL (Optional)</label>
            <input 
              type="url" 
              placeholder="e.g., https://www.youtube.com/watch?v=..." 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 placeholder-gray-400 bg-white focus:bg-gray-50 transition-colors" 
              value={formData.youtubeVideoUrl} 
              onChange={e => setFormData({...formData, youtubeVideoUrl: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Overview Text *</label>
          <BasicRTE value={formData.overviewText} onChange={(val) => setFormData({...formData, overviewText: val})} />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <input 
            type="checkbox" 
            id="publish" 
            className="w-5 h-5 accent-[#98D80D]" 
            checked={formData.isPublished} 
            onChange={e => setFormData({...formData, isPublished: e.target.checked})} 
          />
          <label htmlFor="publish" className="font-bold text-gray-700">Publish this Location</label>
        </div>
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
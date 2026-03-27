// apps/web/app/admin/packages/editor/page.tsx
"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

// Dynamically import ReactQuill to prevent SSR crashes
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-white animate-pulse rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">Loading Editor...</div>
}) as any;
import "react-quill-new/dist/quill.snow.css";

// ==========================================
// REUSABLE RICH TEXT EDITOR COMPONENT
// ==========================================
function CustomRTE({ value, onChange, placeholder, minHeight = "200px" }: { value: string, onChange: (val: string) => void, placeholder?: string, minHeight?: string }) {
  const quillRef = useRef<any>(null);

  const handleRteImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("folder", "packages"); 
        formData.append("asset", file);
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
            method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData
          });
          const data = await res.json();
          if (data.status === "success" && quillRef.current) {
            const url = data.data.url;
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            quill.insertEmbed(range ? range.index : 0, "image", url);
          }
        } catch (err) {
          alert("Failed to upload image inside editor.");
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['link', 'image', 'video'], 
        ['divider'],
        ['clean'] 
      ],
      handlers: {
        image: handleRteImageUpload,
        divider: function() {
          const quill = (this as any).quill;
          const range = quill.getSelection(true);
          quill.insertText(range.index, '\n');
          quill.insertEmbed(range.index + 1, 'divider', true);
          quill.setSelection(range.index + 2);
        }
      }
    }
  }), []);

  return (
    <div className="quill-wrapper relative">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-300 focus-within:border-[#135D66] transition-all">
        <style dangerouslySetInnerHTML={{__html: `
          .quill-wrapper .ql-container { font-size: 1.05rem; min-height: ${minHeight}; height: auto; }
          .quill-wrapper .ql-editor { min-height: ${minHeight}; color: #111827; padding: 1.5rem; line-height: 1.8; }
          .quill-wrapper .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
          .quill-wrapper .ql-toolbar { border-bottom: 1px solid #e5e7eb; background: #f9fafb; padding: 12px; }
          .quill-wrapper .ql-editor blockquote { border-left: 4px solid #135D66; background: #F0F9FA; padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; color: #374151; border-radius: 0 0.5rem 0.5rem 0; }
          .quill-wrapper .ql-toolbar button.ql-divider::after { content: "—"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 900; font-size: 18px; color: #444; }
          .quill-wrapper .ql-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
        `}} />
        <ReactQuill ref={quillRef as any} theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} />
      </div>
    </div>
  );
}

// ==========================================
// MAIN FORM COMPONENT
// ==========================================
function PackageEditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const isEditMode = !!editSlug;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1. CORE STATE ---
  const [coreInfo, setCoreInfo] = useState({
    id: "",
    title: "", slug: "", badgeText: "", description: "", 
    bannerImage: "", tripPlanPdf: "", location: "", category: "Climbing", isPublished: false,
    metaTitle: "", metaDescription: "", metaKeywords: ""
  });

  // --- 2. QUICK FACTS STATE ---
  const [quickFacts, setQuickFacts] = useState({
    heading: "Quick Facts", description: "", image: "",
    items: [{ icon: "", title: "", desc: "" }]
  });

  // --- 3. WHY CHOOSE STATE ---
  const [whyChoose, setWhyChoose] = useState({
    heading: "Why Choose This Route", description: "", image: "",
    items: [{ title: "", desc: "" }],
    table: [{ feature: "", thisRoute: "", otherRoutes: "" }]
  });

  // --- 4. ITINERARY STATE (UPDATED STRUCTURE) ---
  const [itineraryMeta, setItineraryMeta] = useState({
    heading: "Itinerary", description: "", included: [""], notIncluded: [""]
  });
  const [itineraries, setItineraries] = useState<any[]>([
    { tabName: "8-Day Recommended", image: "", documentPdf: "", days: [{ dayNumber: "Day 1", heading: "", description: "", timeTaken: "" }] }
  ]);

  // Safely Register Divider Blot
  useEffect(() => {
    import("react-quill-new").then((ReactQuillModule) => {
      const Quill = ReactQuillModule.Quill;
      if (!Quill) return;
      const BlockEmbed = Quill.import("blots/block/embed") as any;
      class DividerBlot extends BlockEmbed {}
      DividerBlot.blotName = "divider";
      DividerBlot.tagName = "hr";
      try { Quill.register(DividerBlot); } catch (e) {}
    });
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    if (isEditMode) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages/${editSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            const p = data.data;
            setCoreInfo({
                id: p.id || "",
              title: p.title || "", slug: p.slug || "", badgeText: p.badgeText || "",
              description: p.description || "", bannerImage: p.bannerImage || "",
              tripPlanPdf: p.tripPlanPdf || "", location: p.location || "",
              category: p.category || "Climbing", isPublished: p.isPublished || false,
              metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", metaKeywords: p.metaKeywords || ""
            });
            if (p.quickFacts) setQuickFacts(p.quickFacts);
            if (p.whyChoose) setWhyChoose(p.whyChoose);
            if (p.itineraryMeta) setItineraryMeta(p.itineraryMeta);
            if (p.itineraries) setItineraries(p.itineraries);
          }
        }).finally(() => setIsLoading(false));
    }
  }, [editSlug, isEditMode]);

  // --- UNIVERSAL FILE UPLOADER ---
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("folder", "packages"); 
    formData.append("asset", file);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
        method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData
      });
      const data = await res.json();
      if (data.status === "success") return data.data.url;
      throw new Error(data.message);
    } catch (err) {
      alert("Failed to upload file.");
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: any, stateObj: any, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFileToServer(file);
    if (url) setter({ ...stateObj, [field]: url });
  };

  const handleNestedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: "quickFacts", itemIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFileToServer(file);
    if (url && quickFacts.items[itemIndex]) {
      const newFacts = { ...quickFacts };
      const item = newFacts.items[itemIndex];
      if (item) {
        item.icon = url;
      }
      setQuickFacts(newFacts);
    }
  };

  // --- ITINERARY META HANDLERS ---
  const updateIncludedNotIncluded = (field: 'included' | 'notIncluded', index: number, value: string) => {
    const newArr = [...itineraryMeta[field]];
    newArr[index] = value;
    setItineraryMeta({...itineraryMeta, [field]: newArr});
  };
  const addIncludedNotIncluded = (field: 'included' | 'notIncluded') => {
    setItineraryMeta({...itineraryMeta, [field]: [...itineraryMeta[field], ""]});
  };
  const removeIncludedNotIncluded = (field: 'included' | 'notIncluded', index: number) => {
    setItineraryMeta({...itineraryMeta, [field]: itineraryMeta[field].filter((_, i) => i !== index)});
  };

  // --- ITINERARY TAB/DAY HANDLERS ---
  const addTab = () => setItineraries([...itineraries, { tabName: "New Variant", image: "", documentPdf: "", days: [] }]);
  const updateTabField = (index: number, field: string, value: string) => {
    const newItin = [...itineraries];
    newItin[index][field] = value;
    setItineraries(newItin);
  };
  const handleVariantFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tabIndex: number, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFileToServer(file);
    if (url) {
      const newItin = [...itineraries];
      newItin[tabIndex][field] = url;
      setItineraries(newItin);
    }
  };

  const addDay = (tabIndex: number) => {
    const newItin = [...itineraries];
    newItin[tabIndex].days.push({ dayNumber: `Day ${newItin[tabIndex].days.length + 1}`, heading: "", description: "", timeTaken: "" });
    setItineraries(newItin);
  };
  const updateDay = (tabIndex: number, dayIndex: number, field: string, value: string) => {
    const newItin = [...itineraries];
    newItin[tabIndex].days[dayIndex][field] = value;
    setItineraries(newItin);
  };
  const removeDay = (tabIndex: number, dayIndex: number) => {
    const newItin = [...itineraries];
    newItin[tabIndex].days = newItin[tabIndex].days.filter((_:any, i:number) => i !== dayIndex);
    setItineraries(newItin);
  };

  // --- SAVE LOGIC ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        const { id, ...coreData } = coreInfo;
      const payload = { ...coreInfo, quickFacts, whyChoose, itineraryMeta, itineraries };
      const url = isEditMode ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages`;
      const method = isEditMode ? "PUT" : "POST";
      
      const token = localStorage.getItem("adminToken");
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") router.push("/admin/packages");
    } catch (err) {
      alert("Error saving package");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading Data...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/admin/packages" className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#135D66]">
              {isEditMode ? "Edit Package" : "Create New Package"}
            </h2>
            {isEditMode && coreInfo.slug && (
              <a href={`/packages/${coreInfo.slug}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#E59A1D] hover:text-[#c98616] transition-colors flex items-center gap-1.5 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                View Live Package
              </a>
            )}
          </div>
        </div>
        <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[#E59A1D] hover:bg-[#c98616] text-white font-bold rounded-lg shadow-md transition-all">
          {isSaving ? "Saving..." : coreInfo.isPublished ? "Update Published Package" : "Save Package"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* 1. Hero Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold border-b pb-2 text-[#135D66]">1. Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Package Title *</label>
                <input type="text" required placeholder="e.g., Lemosha Route" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900" value={coreInfo.title} onChange={e => setCoreInfo({...coreInfo, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Badge Text</label>
                <input type="text" placeholder="e.g., Most Scenic Approach" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900" value={coreInfo.badgeText} onChange={e => setCoreInfo({...coreInfo, badgeText: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image Upload</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setCoreInfo, coreInfo, "bannerImage")} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700" />
                {coreInfo.bannerImage && (
                  <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                     <Image src={coreInfo.bannerImage} alt="Banner Preview" fill unoptimized className="object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Trip Plan PDF Upload</label>
                <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, setCoreInfo, coreInfo, "tripPlanPdf")} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700" />
                {coreInfo.tripPlanPdf && (
                  <a href={coreInfo.tripPlanPdf} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-sm font-bold text-[#135D66] hover:text-[#E59A1D] transition-colors p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.5 17h-2.5v-10h2.5v10zm-1.25-11.25c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm6.75 11.25h-2.5v-5.5c0-1.38-.56-2.5-2.25-2.5-1.423 0-2.25 1.055-2.25 2.5v5.5h-2.5v-10h4.25v1.5h.063c.594-1.125 2.037-1.875 3.563-1.875 2.375 0 4.125 1.563 4.125 4.875v5.5z"/></svg>
                    View Uploaded Document
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
              <CustomRTE value={coreInfo.description} onChange={(val: string) => setCoreInfo({...coreInfo, description: val})} placeholder="Write a short enticing description..." minHeight="150px" />
            </div>
          </div>

          {/* 2. Quick Facts Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold border-b pb-2 text-[#135D66]">2. Quick Facts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Heading</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900" value={quickFacts.heading} onChange={e => setQuickFacts({...quickFacts, heading: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setQuickFacts, quickFacts, "image")} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700" />
                {quickFacts.image && (
                  <div className="mt-3 relative w-full h-24 rounded-xl overflow-hidden border border-gray-200">
                     <Image src={quickFacts.image} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <CustomRTE value={quickFacts.description} onChange={(val: string) => setQuickFacts({...quickFacts, description: val})} placeholder="Quick facts overview..." minHeight="150px" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Fact Items</label>
                <button type="button" onClick={() => setQuickFacts({...quickFacts, items: [...quickFacts.items, { icon: "", title: "", desc: "" }]})} className="text-sm font-bold text-[#E59A1D] hover:underline">+ Add Fact</button>
              </div>
              {quickFacts.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-lg items-start shadow-sm relative">
                   <button type="button" onClick={() => setQuickFacts({...quickFacts, items: quickFacts.items.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold">✕</button>
                  <div className="w-1/3 pr-2 border-r border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Icon Upload</label>
                    <input type="file" accept="image/*" onChange={(e) => handleNestedFileUpload(e, "quickFacts", idx)} className="w-full border p-1.5 rounded text-xs bg-white" />
                    {item.icon && (
                      <div className="mt-3 w-12 h-12 rounded bg-white border border-gray-200 flex items-center justify-center p-1.5 shadow-sm">
                        <img src={item.icon} alt="Icon" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="w-2/3 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Title (e.g., Duration)</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900" value={item?.title || ""} onChange={e => { const newItems = [...quickFacts.items]; if (newItems[idx]) newItems[idx].title = e.target.value; setQuickFacts({...quickFacts, items: newItems}); }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900" value={item?.desc || ""} onChange={e => { const newItems = [...quickFacts.items]; if (newItems[idx]) newItems[idx].desc = e.target.value; setQuickFacts({...quickFacts, items: newItems}); }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Why Choose Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold border-b pb-2 text-[#135D66]">3. Why Choose This Route</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Heading</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900" value={whyChoose.heading} onChange={e => setWhyChoose({...whyChoose, heading: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Elevation Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setWhyChoose, whyChoose, "image")} className="w-full border border-gray-300 p-2 rounded-xl text-gray-700" />
                {whyChoose.image && (
                  <div className="mt-3 relative w-full h-24 rounded-xl overflow-hidden border border-gray-200">
                     <Image src={whyChoose.image} alt="Preview" fill unoptimized className="object-contain bg-gray-900" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <CustomRTE value={whyChoose.description} onChange={(val: string) => setWhyChoose({...whyChoose, description: val})} placeholder="Why travelers should pick this route..." minHeight="150px" />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Reason Items</label>
                <button type="button" onClick={() => setWhyChoose({...whyChoose, items: [...whyChoose.items, { title: "", desc: "" }]})} className="text-sm font-bold text-[#E59A1D] hover:underline">+ Add Reason</button>
              </div>
              {whyChoose.items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg items-start shadow-sm relative">
                   <button type="button" onClick={() => setWhyChoose({...whyChoose, items: whyChoose.items.filter((_, i) => i !== idx)})} className="absolute top-2 right-4 text-red-500 hover:text-red-700 font-bold md:hidden">✕</button>
                  <div className="w-full md:w-1/3">
                    <input type="text" placeholder="Title (e.g., Scenic & Less Crowded)" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900" value={item?.title || ""} onChange={e => { const newItems = [...whyChoose.items]; if (newItems[idx]) newItems[idx].title = e.target.value; setWhyChoose({...whyChoose, items: newItems}); }} />
                  </div>
                  <div className="w-full md:w-2/3 flex gap-2">
                    <input type="text" placeholder="Description..." className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900" value={item?.desc || ""} onChange={e => { const newItems = [...whyChoose.items]; if (newItems[idx]) newItems[idx].desc = e.target.value; setWhyChoose({...whyChoose, items: newItems}); }} />
                    <button type="button" onClick={() => setWhyChoose({...whyChoose, items: whyChoose.items.filter((_, i) => i !== idx)})} className="text-red-500 hover:text-red-700 font-bold hidden md:block">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Comparison Table (Optional)</label>
                <button type="button" onClick={() => setWhyChoose({...whyChoose, table: [...whyChoose.table, { feature: "", thisRoute: "", otherRoutes: "" }]})} className="text-sm font-bold text-[#E59A1D] hover:underline">+ Add Row</button>
              </div>
              {whyChoose.table.map((row, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg items-center">
                  <input type="text" placeholder="Feature (e.g., Acclimatization)" className="w-1/3 px-3 py-2 border rounded-lg text-sm text-gray-900" value={row.feature} onChange={e => { const newT = [...whyChoose.table]; if (newT[idx]) { newT[idx].feature = e.target.value; setWhyChoose({...whyChoose, table: newT}); } }} />
                  <input type="text" placeholder="This Route" className="w-1/3 px-3 py-2 border rounded-lg text-sm text-gray-900" value={row.thisRoute} onChange={e => { const newT = [...whyChoose.table]; if (newT[idx]) { newT[idx].thisRoute = e.target.value; setWhyChoose({...whyChoose, table: newT}); } }} />
                  <input type="text" placeholder="Other Routes" className="w-1/3 px-3 py-2 border rounded-lg text-sm text-gray-900" value={row.otherRoutes} onChange={e => { const newT = [...whyChoose.table]; if (newT[idx]) { newT[idx].otherRoutes = e.target.value; setWhyChoose({...whyChoose, table: newT}); } }} />
                  <button type="button" onClick={() => setWhyChoose({...whyChoose, table: whyChoose.table.filter((_, i) => i !== idx)})} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Itinerary Builder (UPDATED) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-[#135D66]">4. Itinerary Builder</h3>
            </div>

            {/* Root Level Meta Data */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Heading</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900" value={itineraryMeta.heading} onChange={e => setItineraryMeta({...itineraryMeta, heading: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Description</label>
                <CustomRTE value={itineraryMeta.description} onChange={(val: string) => setItineraryMeta({...itineraryMeta, description: val})} placeholder="Brief overview of the itinerary options..." minHeight="120px" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* What's Included */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="block text-sm font-bold text-gray-700">What's Included</label>
                     <button type="button" onClick={() => addIncludedNotIncluded("included")} className="text-xs font-bold text-[#E59A1D] hover:underline">+ Add</button>
                  </div>
                  {itineraryMeta.included.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" placeholder="e.g., Park & rescue fees" className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900" value={item} onChange={e => updateIncludedNotIncluded("included", idx, e.target.value)} />
                      <button type="button" onClick={() => removeIncludedNotIncluded("included", idx)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
                    </div>
                  ))}
                </div>

                {/* What's Not Included */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="block text-sm font-bold text-gray-700">What's Not Included</label>
                     <button type="button" onClick={() => addIncludedNotIncluded("notIncluded")} className="text-xs font-bold text-[#E59A1D] hover:underline">+ Add</button>
                  </div>
                  {itineraryMeta.notIncluded.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" placeholder="e.g., International flights" className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900" value={item} onChange={e => updateIncludedNotIncluded("notIncluded", idx, e.target.value)} />
                      <button type="button" onClick={() => removeIncludedNotIncluded("notIncluded", idx)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Variant Tabs Mapping */}
            <div className="pt-6 border-t border-gray-200 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800">Itinerary Variants</h4>
                <button type="button" onClick={addTab} className="text-sm font-bold text-white bg-[#E59A1D] px-4 py-2 rounded-lg hover:bg-[#c98616]">+ Add Variant Tab</button>
              </div>

              {itineraries.map((tab, tabIdx) => (
                <div key={tabIdx} className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-6 shadow-inner relative">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex gap-4 items-center">
                      <span className="font-bold text-gray-700">Tab Name:</span>
                      <input type="text" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white shadow-sm" placeholder="e.g., 8-Day Recommended" value={tab.tabName} onChange={(e) => updateTabField(tabIdx, "tabName", e.target.value)} />
                    </div>
                    
                    {/* Variant Image Upload */}
                    <div className="space-y-1">
                       <label className="block text-xs font-bold text-gray-500">Variant Image (Optional)</label>
                       <input type="file" accept="image/*" onChange={(e) => handleVariantFileUpload(e, tabIdx, "image")} className="w-full border p-1.5 rounded text-xs bg-white" />
                       {tab.image && (
                         <div className="mt-2 relative w-full h-20 rounded-lg overflow-hidden border border-gray-200">
                           <Image src={tab.image} alt="Variant Preview" fill unoptimized className="object-cover" />
                         </div>
                       )}
                    </div>

                    {/* Variant PDF Upload */}
                    <div className="space-y-1">
                       <label className="block text-xs font-bold text-gray-500">Itinerary Document (PDF)</label>
                       <input type="file" accept="application/pdf" onChange={(e) => handleVariantFileUpload(e, tabIdx, "documentPdf")} className="w-full border p-1.5 rounded text-xs bg-white" />
                       {tab.documentPdf && (
                          <a href={tab.documentPdf} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs font-bold text-[#135D66] hover:text-[#E59A1D] transition-colors p-2 bg-white border border-gray-200 rounded-lg">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.5 17h-2.5v-10h2.5v10zm-1.25-11.25c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm6.75 11.25h-2.5v-5.5c0-1.38-.56-2.5-2.25-2.5-1.423 0-2.25 1.055-2.25 2.5v5.5h-2.5v-10h4.25v1.5h.063c.594-1.125 2.037-1.875 3.563-1.875 2.375 0 4.125 1.563 4.125 4.875v5.5z"/></svg>
                            View PDF
                          </a>
                       )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    {tab.days.map((day: any, dayIdx: number) => (
                      <div key={dayIdx} className="p-5 bg-white border border-gray-200 rounded-xl space-y-4 shadow-md relative">
                        <button type="button" onClick={() => removeDay(tabIdx, dayIdx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold bg-red-50 px-2 py-1 rounded-md text-xs">Delete Day</button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-24">
                          <input type="text" placeholder="Day (e.g., Day 1)" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 font-bold" value={day.dayNumber} onChange={(e) => updateDay(tabIdx, dayIdx, "dayNumber", e.target.value)} />
                          <input type="text" placeholder="Heading (e.g., LONDOROSSI GATE)" className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 font-bold" value={day.heading} onChange={(e) => updateDay(tabIdx, dayIdx, "heading", e.target.value)} />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Time Taken / Distance</label>
                            <input type="text" placeholder="e.g., 3-4 Hours" className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400" value={day.timeTaken} onChange={(e) => updateDay(tabIdx, dayIdx, "timeTaken", e.target.value)} />
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">Day Description</label>
                             <CustomRTE value={day.description} onChange={(val: string) => updateDay(tabIdx, dayIdx, "description", val)} placeholder="What happens on this day..." minHeight="100px" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addDay(tabIdx)} className="w-full py-4 border-2 border-dashed border-[#135D66] text-[#135D66] font-bold rounded-xl hover:bg-[#E9F4F5] transition-colors shadow-sm">+ Add Another Day to this Tab</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & SEO */}
        <div className="w-full lg:w-1/3 space-y-8">
          
          {/* Publishing Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-[#135D66] text-lg border-b border-gray-100 pb-3">Publishing Status</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm font-bold text-gray-700">Visibility</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={coreInfo.isPublished} onChange={(e) => setCoreInfo({...coreInfo, isPublished: e.target.checked})} />
                <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#98D80D]"></div>
                <span className={`ml-3 text-sm font-bold ${coreInfo.isPublished ? 'text-[#135D66]' : 'text-gray-500'}`}>{coreInfo.isPublished ? 'Published' : 'Draft'}</span>
              </label>
            </div>
          </div>

          {/* Categorization */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-[#135D66] text-lg border-b border-gray-100 pb-3">Categorization</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input type="text" placeholder="e.g., Mount Kilimanjaro" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 bg-gray-50 focus:bg-white placeholder-gray-400" value={coreInfo.location} onChange={e => setCoreInfo({...coreInfo, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 bg-gray-50 focus:bg-white" value={coreInfo.category} onChange={e => setCoreInfo({...coreInfo, category: e.target.value})}>
                <option value="Climbing">Climbing</option>
                <option value="Safari">Safari</option>
                <option value="Day Trips">Day Trips</option>
              </select>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-[#135D66] text-lg border-b border-gray-100 pb-3">Search Engine Optimization</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
              <div className="flex items-stretch">
                <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm font-medium flex items-center">/packages/</span>
                <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-r-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={coreInfo.slug} onChange={(e) => setCoreInfo({...coreInfo, slug: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
              <input type="text" placeholder="Title for Search Engines..." className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={coreInfo.metaTitle} onChange={(e) => setCoreInfo({...coreInfo, metaTitle: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
              <textarea rows={4} placeholder="Brief summary for Google..." className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white resize-none" value={coreInfo.metaDescription} onChange={(e) => setCoreInfo({...coreInfo, metaDescription: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Keywords</label>
              <input type="text" placeholder="kilimanjaro, safari, climbing" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white" value={coreInfo.metaKeywords} onChange={(e) => setCoreInfo({...coreInfo, metaKeywords: e.target.value})} />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}

export default function PackageEditorPage() {
  return (
    <div className="min-h-screen py-10">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center pt-32 text-gray-500">
           <div className="w-12 h-12 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-4"></div>
           <p className="font-bold">Loading Editor Tools...</p>
        </div>
      }>
        <PackageEditorForm />
      </Suspense>
    </div>
  );
}
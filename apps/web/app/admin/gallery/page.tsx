// apps/web/app/admin/gallery/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch, getAdminToken } from "../../../lib/apiClient";

const CATEGORIES = ["Climbing", "Safari", "Destinations", "Day Trips"];

export default function GalleryAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"IMAGE" | "VIDEO">("IMAGE");

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(() => CATEGORIES[0] ?? "");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { ok, data } = await apiFetch("/gallery");
      if (ok && data) setItems(data);
    } catch (err) {
      console.error("Failed to load gallery items", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image.");

    setIsSaving(true);
    try {
      // 1. Upload file to server specifically in the 'gallery' folder
      const formData = new FormData();
      formData.append("folder", "gallery");
      formData.append("asset", imageFile);

      const uploadRes = await apiFetch("/upload", {
        method: "POST",
        token: getAdminToken(),
        body: formData,
      });

      if (!uploadRes.ok || !uploadRes.data?.url) {
        throw new Error("Failed to upload image file.");
      }

      // 2. Save record to database
      const dbRes = await apiFetch("/gallery", {
        method: "POST",
        token: getAdminToken(),
        body: JSON.stringify({
          type: "IMAGE",
          url: uploadRes.data.url,
          category,
          title,
        }),
      });

      if (dbRes.ok) {
        alert("Image uploaded successfully!");
        setImageFile(null);
        setTitle("");
        fetchGallery();
      } else {
        alert("Failed to save gallery record.");
      }
    } catch (error) {
      alert("Error processing upload.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return alert("Please enter a YouTube URL.");

    setIsSaving(true);
    try {
      const dbRes = await apiFetch("/gallery", {
        method: "POST",
        token: getAdminToken(),
        body: JSON.stringify({
          type: "VIDEO",
          url: videoUrl,
          title,
          category: null, // Videos are uncategorized based on requirements
        }),
      });

      if (dbRes.ok) {
        alert("Video added successfully!");
        setVideoUrl("");
        setTitle("");
        fetchGallery();
      } else {
        alert("Failed to save video record.");
      }
    } catch (error) {
      alert("Error saving video.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    
    try {
      const { ok } = await apiFetch(`/gallery/${id}`, {
        method: "DELETE",
        token: getAdminToken(),
      });

      if (ok) {
        setItems(items.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  // Helper to extract YouTube video ID for thumbnails
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match?.[2]?.length === 11 ? match[2] : null;
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3 inline-block">← Back to Dashboard</Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Manage Gallery</h1>
          <p className="text-gray-500 font-medium">Upload categorized images and link YouTube videos.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Upload/Add Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab("IMAGE")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "IMAGE" ? "bg-[#E9F4F5] text-[#135D66] border-b-2 border-[#135D66]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                Upload Image
              </button>
              <button 
                onClick={() => setActiveTab("VIDEO")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "VIDEO" ? "bg-[#E9F4F5] text-[#135D66] border-b-2 border-[#135D66]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                Add Video
              </button>
            </div>

            <div className="p-6">
              {activeTab === "IMAGE" ? (
                <form onSubmit={handleUploadImage} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:border-[#135D66]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Image *</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      required
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 p-2 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title / Alt Text (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Summit at sunrise"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]"
                    />
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-3.5 bg-[#135D66] text-white font-bold rounded-xl hover:bg-[#0f4a52] transition-colors disabled:opacity-50">
                    {isSaving ? "Uploading..." : "Upload Image"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddVideo} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL *</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Video Title (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Kilimanjaro Client Testimonial"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]"
                    />
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-3.5 bg-[#fe6e00] text-white font-bold rounded-xl hover:bg-[#c98616] transition-colors disabled:opacity-50">
                    {isSaving ? "Saving..." : "Add Video URL"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Display Gallery */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-extrabold text-lg text-gray-900 mb-6 border-b pb-3">Live Gallery Assets</h3>
            
            {isLoading ? (
              <div className="text-center py-10 font-bold text-gray-400">Loading gallery...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No media items uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                    
                    {/* Media Display */}
                    {item.type === "IMAGE" ? (
                      <Image src={item.url} alt={item.title || "Gallery Image"} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full relative">
                        <Image src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} alt="Video Thumbnail" fill unoptimized className="object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overlay Info & Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded text-white ${item.type === "IMAGE" ? "bg-[#135D66]" : "bg-red-600"}`}>
                          {item.type}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-white text-gray-900">
                            {item.category}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-white font-medium truncate pr-2">
                          {item.title || "No Title"}
                        </p>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
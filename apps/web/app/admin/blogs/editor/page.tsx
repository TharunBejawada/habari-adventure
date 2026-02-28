// apps/web/app/admin/blogs/editor/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import ReactQuill to prevent Server-Side Rendering (SSR) crashes
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Editor...</div>
});
import "react-quill-new/dist/quill.snow.css";

// Quill Toolbar Configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

// We wrap the actual editor logic in a component so we can use useSearchParams safely
function EditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState(""); // Comma separated
  const [featuredImage, setFeaturedImage] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [readingTime, setReadingTime] = useState<number | "">("");
  
  // SEO State
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  
  // FAQs State
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);

  // Fetch existing data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchBlog = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/v1/blogs/${editId}`);
          const data = await res.json();
          if (data.status === "success") {
            const b = data.data;
            setTitle(b.title || "");
            setSlug(b.slug || "");
            setContent(b.content || "");
            setExcerpt(b.excerpt || "");
            setCategory(b.category || "");
            setTags(b.tags ? b.tags.join(", ") : "");
            setFeaturedImage(b.featuredImage || "");
            setImageAltText(b.imageAltText || "");
            setIsPublished(b.isPublished || false);
            setReadingTime(b.readingTime || "");
            setMetaTitle(b.metaTitle || "");
            setMetaDescription(b.metaDescription || "");
            setMetaKeywords(b.metaKeywords || "");
            setFaqs(b.faqs || []);
          } else {
            setError(data.message || "Failed to load blog");
          }
        } catch (err) {
          setError("Network error fetching blog.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBlog();
    }
  }, [editId, isEditMode]);

  // Auto-generate Slug from Title (only if slug is empty)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditMode && !slug) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  // FAQ Handlers
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  // Save Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const userStr = localStorage.getItem("adminUser");
      const user = userStr ? JSON.parse(userStr) : null;
      const authorName = user ? `${user.firstName} ${user.lastName}` : "Admin Team";

      const payload = {
        title, slug, content, excerpt, category,
        tags: tags.split(",").map(t => t.trim()).filter(t => t), // Convert to array
        featuredImage, imageAltText, isPublished, 
        readingTime: readingTime ? Number(readingTime) : null,
        metaTitle, metaDescription, metaKeywords, faqs, authorName,
        // If publishing for the first time, set the date
        ...(isPublished && { publishedAt: new Date().toISOString() })
      };

      const url = isEditMode ? `http://localhost:8000/api/v1/blogs/${editId}` : "http://localhost:8000/api/v1/blogs";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === "success") {
        router.push("/admin/blogs");
      } else {
        setError(data.message || "Failed to save post");
      }
    } catch (err) {
      setError("Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Article" : "Write New Article"}
            </h2>
          </div>
        </div>
        <button 
          type="submit" disabled={isSaving}
          className="px-6 py-2.5 bg-adventure-600 hover:bg-adventure-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-70 transition-colors flex items-center"
        >
          {isSaving ? "Saving..." : isPublished ? "Publish Updates" : "Save Article"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT COLUMN: MAIN EDITOR --- */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Main Content Box */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article Title *</label>
              <input 
                type="text" required
                className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-adventure-500 outline-none"
                placeholder="e.g., The Ultimate Guide to Climbing Kilimanjaro"
                value={title} onChange={handleTitleChange}
              />
            </div>

            <div className="quill-wrapper">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article Content *</label>
              <div className="bg-white dark:bg-gray-50 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                 {/* We use a custom wrapper to let Quill auto-expand.
                   The styling targets .ql-container to remove fixed heights.
                 */}
                 <style dangerouslySetInnerHTML={{__html: `
                   .quill-wrapper .ql-container { font-size: 1rem; min-height: 400px; height: auto; }
                   .quill-wrapper .ql-editor { min-height: 400px; }
                 `}} />
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={modules}
                  placeholder="Start writing your amazing adventure..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Excerpt</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-adventure-500 outline-none"
                placeholder="A brief 2-3 sentence summary that appears on the blog listing cards..."
                value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* FAQs Builder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Frequently Asked Questions (Schema)</h3>
              <button type="button" onClick={addFaq} className="text-sm font-medium text-adventure-600 hover:text-adventure-700 dark:text-adventure-400">
                + Add FAQ
              </button>
            </div>
            
            {faqs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">No FAQs added yet. Adding them improves SEO rich snippets.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                    <button type="button" onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="space-y-3">
                      <input 
                        type="text" placeholder="Question..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm font-medium outline-none"
                        value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)}
                      />
                      <textarea 
                        rows={2} placeholder="Answer..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm outline-none"
                        value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: SETTINGS & SEO --- */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Publishing Settings */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Publishing</h3>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-adventure-600"></div>
                <span className="ml-3 text-sm font-bold text-gray-900 dark:text-white">{isPublished ? 'Published' : 'Draft'}</span>
              </label>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Reading Time (Mins)</label>
               <input 
                 type="number" min="1"
                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
                 value={readingTime} onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")}
               />
            </div>
          </div>

          {/* Media & Categorization */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Organization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input 
                type="text" placeholder="e.g., Guides, Destinations"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
                value={category} onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (Comma separated)</label>
              <input 
                type="text" placeholder="hiking, gear, tips"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                value={tags} onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured Image URL</label>
              <input 
                type="url" placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm mb-2"
                value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
              />
              {featuredImage && (
                <div className="w-full h-32 rounded-lg bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url(${featuredImage})` }}></div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Alt Text</label>
              <input 
                type="text" placeholder="Describe the image for SEO"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                value={imageAltText} onChange={(e) => setImageAltText(e.target.value)}
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">SEO Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug *</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500 text-sm">/blog/</span>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                  value={slug} onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
              <input 
                type="text" placeholder="Title for Search Engines..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
              <textarea 
                rows={3} placeholder="Brief summary for Google results..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Keywords</label>
              <input 
                type="text" placeholder="keyword1, keyword2..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none text-sm"
                value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}

// Wrap the entire component in a Suspense boundary for Next.js App Router rules
export default function BlogEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor tools...</div>}>
      <EditorForm />
    </Suspense>
  );
}
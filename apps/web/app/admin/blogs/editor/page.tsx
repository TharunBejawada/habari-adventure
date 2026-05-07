// // apps/web/app/admin/blogs/editor/page.tsx
// "use client";

// import { useState, useEffect, Suspense, useRef, useMemo } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // Dynamically import ReactQuill to prevent SSR crashes
// const ReactQuill = dynamic(() => import("react-quill-new"), { 
//   ssr: false,
//   loading: () => <div className="h-[500px] w-full bg-white animate-pulse rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 shadow-sm"><div className="w-8 h-8 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-3"></div>Loading Editor...</div>
// }) as any;
// import "react-quill-new/dist/quill.snow.css";

// function EditorForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editId = searchParams.get("id");
//   const isEditMode = !!editId;

//   const quillRef = useRef<any>(null);

//   const [isLoading, setIsLoading] = useState(isEditMode);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isUploadingBanner, setIsUploadingBanner] = useState(false);
//   const [error, setError] = useState("");

//   // Form State
//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [content, setContent] = useState("");
//   const [excerpt, setExcerpt] = useState("");
//   const [category, setCategory] = useState("");
//   const [authorName, setAuthorName] = useState("");
//   const [publishedAt, setPublishedAt] = useState("");
//   const [isPublished, setIsPublished] = useState(false);
//   const [readingTime, setReadingTime] = useState<number | "">("");
  
//   // Tags & Banner State
//   const [tagInput, setTagInput] = useState("");
//   const [tags, setTags] = useState<string[]>([]);
//   const [featuredImage, setFeaturedImage] = useState("");
//   const [imageAltText, setImageAltText] = useState("");
  
//   // SEO & FAQs
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [metaKeywords, setMetaKeywords] = useState("");
//   const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);

// // 1. SAFELY REGISTER CUSTOM QUILL BLOTS (Like Horizontal Rule) FOR NEXT.JS
//   useEffect(() => {
//     import("react-quill-new").then((ReactQuillModule) => {
//       const Quill = ReactQuillModule.Quill;
//       if (!Quill) return;

//       // THE FIX: Add 'as any' here to satisfy TypeScript's strict build checks!
//       const BlockEmbed = Quill.import("blots/block/embed") as any;
      
//       class DividerBlot extends BlockEmbed {}
//       DividerBlot.blotName = "divider";
//       DividerBlot.tagName = "hr";
      
//       // Only register if it hasn't been registered yet to prevent hot-reload errors
//       try {
//         Quill.register(DividerBlot);
//       } catch (e) {
//         // Already registered
//       }
//     });
//   }, []);

//   // Fetch existing data if editing, and set default author
//   useEffect(() => {
//     const userStr = localStorage.getItem("adminUser");
//     if (userStr) {
//       const user = JSON.parse(userStr);
//       if (!isEditMode) setAuthorName(`${user.firstName} ${user.lastName}`);
//     }

//     if (isEditMode) {
//       const fetchBlog = async () => {
//         try {
//           const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${editId}`);
//           const data = await res.json();
//           if (data.status === "success") {
//             const b = data.data;
//             setTitle(b.title || "");
//             setSlug(b.slug || "");
//             setContent(b.content || "");
//             setExcerpt(b.excerpt || "");
//             setCategory(b.category || "");
//             setTags(b.tags || []);
//             setFeaturedImage(b.featuredImage || "");
//             setImageAltText(b.imageAltText || "");
//             setIsPublished(b.isPublished || false);
//             setReadingTime(b.readingTime || "");
//             setAuthorName(b.authorName || authorName);
//             setMetaTitle(b.metaTitle || "");
//             setMetaDescription(b.metaDescription || "");
//             setMetaKeywords(b.metaKeywords || "");
//             setFaqs(b.faqs || []);
            
//             if (b.publishedAt) {
//               const date = new Date(b.publishedAt);
//               setPublishedAt(date.toISOString().slice(0, 16));
//             }
//           } else {
//             setError(data.message || "Failed to load blog");
//           }
//         } catch (err) {
//           setError("Network error fetching blog.");
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchBlog();
//     }
//   }, [editId, isEditMode]);

//   // --- UPLOAD HANDLER ---
//   const uploadImageToServer = async (file: File): Promise<string | null> => {
//     const formData = new FormData();
//     formData.append("folder", "blogs"); 
//     formData.append("asset", file);

//     try {
//       const token = localStorage.getItem("adminToken");
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload?folder=blogs`, {
//         method: "POST",
//         headers: { "Authorization": `Bearer ${token}` },
//         body: formData
//       });
//       const data = await res.json();
//       if (data.status === "success") {
//         return data.data.url; 
//       }
//       throw new Error(data.message);
//     } catch (err) {
//       console.error("Upload failed", err);
//       alert("Failed to upload image. Please try again.");
//       return null;
//     }
//   };

//   const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setIsUploadingBanner(true);
//     const url = await uploadImageToServer(file);
//     if (url) setFeaturedImage(url);
//     setIsUploadingBanner(false);
//   };

//   // --- RTE IMAGE HANDLER ---
//   const handleRteImageUpload = () => {
//     const input = document.createElement("input");
//     input.setAttribute("type", "file");
//     input.setAttribute("accept", "image/*");
//     input.click();

//     input.onchange = async () => {
//       const file = input.files?.[0];
//       if (file) {
//         const url = await uploadImageToServer(file);
//         if (url && quillRef.current) {
//           const quill = quillRef.current.getEditor();
//           const range = quill.getSelection();
//           quill.insertEmbed(range ? range.index : 0, "image", url);
//         }
//       }
//     };
//   };

//   // --- CUSTOM TOOLBAR CONFIGURATION ---
//   const modules = useMemo(() => ({
//     toolbar: {
//       container: [
//         [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
//         [{ 'size': ['small', false, 'large', 'huge'] }],
        
//         ['bold', 'italic', 'underline', 'strike'],
//         [{ 'color': [] }, { 'background': [] }],
        
//         // Lists, Alignment, & Indents
//         [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//         [{ 'align': [] }], 
//         [{ 'indent': '-1'}, { 'indent': '+1' }], 
        
//         // Scripts & Block Formats
//         [{ 'script': 'sub'}, { 'script': 'super' }],
//         ['blockquote', 'code-block'],
        
//         // Media & Custom Divider
//         ['link', 'image', 'video'], 
//         ['divider'], // Custom Horizontal Line button
//         ['clean']
//       ],
//       handlers: {
//         image: handleRteImageUpload,
//         // Handler for our Custom Horizontal Line button
//         divider: function() {
//           const quill = (this as any).quill;
//           const range = quill.getSelection(true);
//           quill.insertText(range.index, '\n');
//           quill.insertEmbed(range.index + 1, 'divider', true);
//           quill.setSelection(range.index + 2);
//         }
//       }
//     }
//   }), []);

//   // --- TAGS HANDLER ---
//   const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
//     if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
//     e.preventDefault();
//     const newTag = tagInput.trim();
//     if (newTag && !tags.includes(newTag)) {
//       setTags([...tags, newTag]);
//     }
//     setTagInput("");
//   };

//   const removeTag = (tagToRemove: string) => {
//     setTags(tags.filter(t => t !== tagToRemove));
//   };

//   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);
//     if (!isEditMode && !slug) {
//       setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
//     }
//   };

//   const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
//   const updateFaq = (index: number, field: "question" | "answer", value: string) => {
//     const newFaqs = [...faqs];
//     if (newFaqs[index]) {
//       newFaqs[index][field] = value;
//       setFaqs(newFaqs);
//     }
//   };
//   const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

//   // --- SAVE HANDLER ---
//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title || !content) return alert("Title and Content are required!");
    
//     setIsSaving(true);
//     setError("");

//     try {
//       const token = localStorage.getItem("adminToken");
//       const payload = {
//         title, slug, content, excerpt, category, tags,
//         featuredImage, imageAltText, isPublished, 
//         readingTime: readingTime ? Number(readingTime) : null,
//         metaTitle, metaDescription, metaKeywords, faqs, authorName,
//         publishedAt: publishedAt ? new Date(publishedAt).toISOString() : (isPublished ? new Date().toISOString() : null)
//       };

//       const url = isEditMode ? `${process.env.NEXT_PUBLIC_API_URL}/blogs/${editId}` : `${process.env.NEXT_PUBLIC_API_URL}/blogs`;
//       const method = isEditMode ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (data.status === "success") {
//         router.push("/admin/blogs");
//       } else {
//         setError(data.message || "Failed to save post");
//       }
//     } catch (err) {
//       setError("Network error while saving.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading editor...</div>;

//   return (
//     <form onSubmit={handleSave} className="space-y-8 max-w-[1400px] mx-auto">
//       {/* Back to Dashboard Link */}
//           <Link 
//             href="/admin" 
//             className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group"
//           >
//             <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </svg>
//             Back to Dashboard
//           </Link>
      
//       {/* Header Actions */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//         <div className="flex items-center gap-4">
//           <Link 
//             href="/admin/blogs" 
//             className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"
//           >
//             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
//           </Link>
//           <div>
//             <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
//               {isEditMode ? "Edit Article" : "Write New Article"}
//             </h2>
//             <p className="text-sm text-gray-500 font-medium mt-0.5">Manage your blog content and SEO metadata.</p>
//           </div>
//         </div>
//         <button 
//           type="submit" disabled={isSaving}
//           className="px-8 py-3 bg-[#135D66] hover:bg-[#0e4850] text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all flex items-center w-full sm:w-auto justify-center"
//         >
//           {isSaving ? "Saving..." : isPublished ? "Update Published Post" : "Save Draft"}
//         </button>
//       </div>

//       {error && (
//         <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-bold shadow-sm">
//           {error}
//         </div>
//       )}

//       {/* --- BANNER IMAGE SECTION --- */}
//       <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
//         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//           <svg className="w-5 h-5 text-[#E59A1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
//           Blog Banner Image
//         </h3>
        
//         <div className="relative w-full h-64 md:h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 hover:border-[#135D66] rounded-xl overflow-hidden flex flex-col items-center justify-center group transition-colors">
//           {featuredImage ? (
//              <img src={featuredImage} alt="Banner Preview" className="w-full h-full object-cover" />
//           ) : (
//             <div className="text-center p-6">
//               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400 group-hover:text-[#135D66] transition-colors">
//                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
//               </div>
//               <p className="text-base font-bold text-gray-700">Click or drag image to upload banner</p>
//               <p className="text-sm text-gray-400 mt-1">High-resolution image (1200 x 600px recommended)</p>
//             </div>
//           )}
          
//           {isUploadingBanner && (
//             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
//               <div className="w-10 h-10 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-3"></div>
//               <span className="font-bold text-[#135D66]">Uploading to secure server...</span>
//             </div>
//           )}

//           <input 
//             type="file" accept="image/*" 
//             onChange={handleBannerUpload}
//             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//           />
//         </div>

//         <div className="mt-6">
//           <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image Alt Text (Optional but recommended for SEO)</label>
//           <input 
//             type="text" placeholder="Describe the image for search engines and screen readers..."
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//             value={imageAltText} onChange={(e) => setImageAltText(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-8">
        
//         {/* --- LEFT COLUMN: MAIN EDITOR --- */}
//         <div className="w-full lg:w-2/3 space-y-8">
          
//           <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            
//             {/* Title */}
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Article Title *</label>
//               <input 
//                 type="text" required
//                 className="w-full px-4 py-4 text-xl font-bold border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] outline-none transition-colors text-gray-900 placeholder-gray-400"
//                 placeholder="e.g., The Ultimate Guide to Climbing Kilimanjaro"
//                 value={title} onChange={handleTitleChange}
//               />
//             </div>

//             {/* Author & Category */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Author Name</label>
//                 <input 
//                   type="text" placeholder="Enter author name"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                   value={authorName} onChange={(e) => setAuthorName(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
//                 <input 
//                   type="text" placeholder="e.g., Safari, Climbing, Travel Tips"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                   value={category} onChange={(e) => setCategory(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Rich Text Editor */}
//             <div className="quill-wrapper relative">
//               <label className="block text-sm font-bold text-gray-700 mb-2">Article Content *</label>
//               <div className="bg-white rounded-xl overflow-hidden border border-gray-300 focus-within:border-[#135D66] focus-within:ring-1 focus-within:ring-[#135D66] transition-all">
//                  {/* CSS Fixes for Quill: Enhanced Typography, Quotes, & Line Icon */}
//                  <style dangerouslySetInnerHTML={{__html: `
//                    /* Editor Dimensions & Text styling */
//                    .quill-wrapper .ql-container { font-size: 1.05rem; min-height: 500px; height: auto; }
//                    .quill-wrapper .ql-editor { min-height: 500px; color: #111827; padding: 1.5rem; line-height: 1.8; }
//                    .quill-wrapper .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
                   
//                    /* Toolbar Styling */
//                    .quill-wrapper .ql-toolbar { border-bottom: 1px solid #e5e7eb; background: #f9fafb; padding: 12px; border-radius: 0.75rem 0.75rem 0 0; }
                   
//                    /* Beautiful Blockquotes */
//                    .quill-wrapper .ql-editor blockquote {
//                      border-left: 4px solid #135D66;
//                      background: #F0F9FA;
//                      padding: 1rem 1.5rem;
//                      margin: 1.5rem 0;
//                      color: #374151;
//                      font-style: italic;
//                      border-radius: 0 0.5rem 0.5rem 0;
//                    }

//                    /* Custom Horizontal Line (Divider) Icon in Toolbar */
//                    .quill-wrapper .ql-toolbar button.ql-divider {
//                      width: 28px;
//                      position: relative;
//                    }
//                    .quill-wrapper .ql-toolbar button.ql-divider::after {
//                      content: "—";
//                      position: absolute;
//                      top: 50%; left: 50%;
//                      transform: translate(-50%, -50%);
//                      font-weight: 900;
//                      font-size: 18px;
//                      color: #444;
//                    }
//                    .quill-wrapper .ql-toolbar button.ql-divider:hover::after { color: #135D66; }

//                    /* Render Horizontal Rules nicely */
//                    .quill-wrapper .ql-editor hr {
//                      border: none;
//                      border-top: 2px solid #e5e7eb;
//                      margin: 2rem 0;
//                    }

//                    /* Fix Image alignments visually inside the editor */
//                    .quill-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
//                    .quill-wrapper .ql-editor .ql-align-center img { display: block; margin: 1rem auto; }
//                    .quill-wrapper .ql-editor .ql-align-right img { float: right; margin-left: 1rem; }
//                    .quill-wrapper .ql-editor .ql-align-left img { float: left; margin-right: 1rem; }
//                  `}} />
                
//                 <ReactQuill 
//                   ref={quillRef}
//                   theme="snow" 
//                   value={content} 
//                   onChange={setContent} 
//                   modules={modules}
//                   placeholder="Start writing your amazing adventure..."
//                 />
//               </div>
//               <p className="text-xs text-gray-400 mt-2 text-right">
//                 Tip: To align an image, click the image in the editor, then click the align icons in the toolbar.
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt (Optional)</label>
//               <textarea 
//                 rows={3}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors resize-none"
//                 placeholder="A brief 2-3 sentence summary that will appear on the blog listing cards..."
//                 value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* FAQs Builder */}
//           <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
//                 <p className="text-sm text-gray-500 mt-1">Add FAQs to help this article rank for Google Rich Snippets.</p>
//               </div>
//               <button type="button" onClick={addFaq} className="px-4 py-2 bg-[#E9F4F5] text-[#135D66] font-bold text-sm rounded-lg hover:bg-[#135D66] hover:text-white transition-colors">
//                 + Add FAQ
//               </button>
//             </div>
            
//             {faqs.length === 0 ? (
//               <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
//                 <p className="text-sm font-medium text-gray-500">No FAQs added yet.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {faqs.map((faq, index) => (
//                   <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 relative group transition-colors hover:border-gray-300">
//                     <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
//                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
//                     </button>
//                     <div className="space-y-3 pr-6">
//                       <input 
//                         type="text" placeholder="Question..."
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] font-bold text-gray-900 placeholder-gray-400 bg-white"
//                         value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)}
//                       />
//                       <textarea 
//                         rows={2} placeholder="Answer..."
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white resize-none"
//                         value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* --- RIGHT COLUMN: SETTINGS & SEO --- */}
//         <div className="w-full lg:w-1/3 space-y-8">
          
//           {/* Publishing Settings */}
//           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
//             <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Publishing Status</h3>
            
//             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
//               <span className="text-sm font-bold text-gray-700">Visibility</span>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
//                 <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#98D80D]"></div>
//                 <span className={`ml-3 text-sm font-bold ${isPublished ? 'text-[#135D66]' : 'text-gray-500'}`}>{isPublished ? 'Published' : 'Draft'}</span>
//               </label>
//             </div>

//             <div>
//                <label className="block text-sm font-bold text-gray-700 mb-2">Override Publish Date</label>
//                <input 
//                  type="datetime-local"
//                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white transition-colors"
//                  value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
//                />
//                <p className="text-xs text-gray-400 font-medium mt-1.5 leading-relaxed">Leave blank to use the current date and time upon publishing.</p>
//             </div>

//             <div>
//                <label className="block text-sm font-bold text-gray-700 mb-2">Est. Reading Time (Mins)</label>
//                <input 
//                  type="number" min="1" placeholder="e.g. 5"
//                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                  value={readingTime} onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")}
//                />
//             </div>
//           </div>

//           {/* Tags */}
//           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
//             <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-5">Tags</h3>
            
//             <div className="flex gap-2 mb-5">
//               <input 
//                 type="text" placeholder="Add a tag and press Enter..."
//                 className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                 value={tagInput} 
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyDown={handleAddTag}
//               />
//               <button 
//                 type="button" onClick={handleAddTag}
//                 className="px-5 py-3 bg-[#135D66] hover:bg-[#0e4850] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
//               >
//                 Add
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-2.5">
//               {tags.map((tag, idx) => (
//                 <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#E9F4F5] text-[#135D66] border border-[#135D66]/20">
//                   {tag}
//                   <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 hover:bg-white rounded-full p-0.5 transition-colors focus:outline-none">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
//                   </button>
//                 </span>
//               ))}
//               {tags.length === 0 && <span className="text-sm text-gray-400 font-medium">No tags added yet.</span>}
//             </div>
//           </div>

//           {/* SEO Metadata */}
//           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
//             <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Search Engine Optimization</h3>
            
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
//               <div className="flex items-stretch">
//                 <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm font-medium flex items-center">/blogs/</span>
//                 <input 
//                   type="text" required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-r-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                   value={slug} onChange={(e) => setSlug(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
//               <input 
//                 type="text" placeholder="Title for Search Engines..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                 value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
//               <textarea 
//                 rows={4} placeholder="Brief summary to display in Google search results..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors resize-none"
//                 value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Meta Keywords</label>
//               <input 
//                 type="text" placeholder="kilimanjaro, safari, climbing (comma separated)"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white transition-colors"
//                 value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
//               />
//             </div>
//           </div>

//         </div>
//       </div>
//     </form>
//   );
// }

// // Wrap the entire component in a Suspense boundary for Next.js App Router rules
// export default function BlogEditorPage() {
//   return (
//     <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
//       <Suspense fallback={
//         <div className="flex flex-col items-center justify-center pt-32 text-gray-500">
//            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-4"></div>
//            <p className="font-bold">Loading Editor Tools...</p>
//         </div>
//       }>
//         <EditorForm />
//       </Suspense>
//     </div>
//   );
// }
// apps/web/app/admin/blogs/editor/page.tsx
"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

// IMPORT YOUR CENTRALIZED LANGUAGES (Adjust path if needed)
import { SUPPORTED_LANGUAGES } from "../../../../lib/languages";
import { apiFetch, getAdminToken } from "../../../../lib/apiClient";

// Dynamically import ReactQuill to prevent SSR crashes
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-white animate-pulse rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 shadow-sm"><div className="w-8 h-8 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-3"></div>Loading Editor...</div>
}) as any;
import "react-quill-new/dist/quill.snow.css";

function EditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = !!editId;

  const quillRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [error, setError] = useState("");

  // --- NEW: LANGUAGE & SNAPSHOT STATE ---
  const [activeLang, setActiveLang] = useState('en');
  const [snapshot, setSnapshot] = useState<string>("");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [readingTime, setReadingTime] = useState<number | "">("");
  
  // Tags & Banner State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  
  // SEO & FAQs
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);

  // 1. SAFELY REGISTER CUSTOM QUILL BLOTS
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

  // Fetch existing data
  useEffect(() => {
    const userStr = localStorage.getItem("adminUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (!isEditMode) setAuthorName(`${user.firstName} ${user.lastName}`);
    }

    if (isEditMode) {
      const fetchBlog = async () => {
        try {
          const { ok, data, error } = await apiFetch(`/blogs/${editId}`);
          if (ok && data) {
            const b = data;
            setTitle(b.title || "");
            setSlug(b.slug || "");
            setContent(b.content || "");
            setExcerpt(b.excerpt || "");
            setCategory(b.category || "");
            setTags(b.tags || []);
            setFeaturedImage(b.featuredImage || "");
            setImageAltText(b.imageAltText || "");
            setIsPublished(b.isPublished || false);
            setReadingTime(b.readingTime || "");
            setAuthorName(b.authorName || authorName);
            setMetaTitle(b.metaTitle || "");
            setMetaDescription(b.metaDescription || "");
            setMetaKeywords(b.metaKeywords || "");
            setFaqs(b.faqs || []);

            if (b.publishedAt) {
              const date = new Date(b.publishedAt);
              setPublishedAt(date.toISOString().slice(0, 16));
            }

            // Set snapshot of translatable fields
            setSnapshot(JSON.stringify({
              title: b.title || "", slug: b.slug || "", content: b.content || "",
              excerpt: b.excerpt || "", category: b.category || "", tags: b.tags || [],
              imageAltText: b.imageAltText || "", metaTitle: b.metaTitle || "",
              metaDescription: b.metaDescription || "", metaKeywords: b.metaKeywords || "", faqs: b.faqs || []
            }));
          } else {
            setError(error || "Failed to load blog");
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

  // --- NEW: LANGUAGE SWITCH HANDLER ---
  const handleLanguageSwitch = async (langCode: string) => {
    if (langCode === activeLang) return;
    
    if (!isEditMode) {
      alert("Please save the English blog post first before adding translations.");
      return;
    }

    setActiveLang(langCode);
    setIsLoading(true);

    try {
      const { ok, data } = await apiFetch(`/blogs/${editId}?lang=${langCode}`);

      if (ok && data) {
        const b = data;
        setTitle(b.title || "");
        setSlug(b.slug || "");
        setContent(b.content || "");
        setExcerpt(b.excerpt || "");
        setCategory(b.category || "");
        setTags(b.tags || []);
        setFeaturedImage(b.featuredImage || ""); // Global
        setImageAltText(b.imageAltText || "");
        setIsPublished(b.isPublished || false); // Global
        setReadingTime(b.readingTime || ""); // Global
        setAuthorName(b.authorName || ""); // Global
        setMetaTitle(b.metaTitle || "");
        setMetaDescription(b.metaDescription || "");
        setMetaKeywords(b.metaKeywords || "");
        setFaqs(b.faqs || []);

        setSnapshot(JSON.stringify({
          title: b.title || "", slug: b.slug || "", content: b.content || "",
          excerpt: b.excerpt || "", category: b.category || "", tags: b.tags || [],
          imageAltText: b.imageAltText || "", metaTitle: b.metaTitle || "",
          metaDescription: b.metaDescription || "", metaKeywords: b.metaKeywords || "", faqs: b.faqs || []
        }));
      }
    } catch (err) {
      console.error("Failed to load translation");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPLOAD HANDLER ---
  const uploadImageToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("folder", "blogs");
    formData.append("asset", file);

    try {
      const { ok, data } = await apiFetch("/upload?folder=blogs", {
        method: "POST",
        token: getAdminToken(),
        body: formData
      });
      if (ok && data) return data.url;
      throw new Error("Upload failed");
    } catch (err) {
      alert("Failed to upload image.");
      return null;
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    const url = await uploadImageToServer(file);
    if (url) setFeaturedImage(url);
    setIsUploadingBanner(false);
  };

  // --- RTE IMAGE HANDLER ---
  const handleRteImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const url = await uploadImageToServer(file);
        if (url && quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range ? range.index : 0, "image", url);
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }], [{ 'indent': '-1'}, { 'indent': '+1' }], 
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'], ['divider'], ['clean']
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

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter(t => t !== tagToRemove));

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditMode && !slug) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...faqs];
    if (newFaqs[index]) { newFaqs[index][field] = value; setFaqs(newFaqs); }
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  // --- SAVE HANDLER ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Title and Content are required!");
    
    setIsSaving(true);
    setError("");

    try {
      // SAFETY LOCK
      if (activeLang !== 'en') {
        const translatableData = { title, slug, content, excerpt, category, tags, imageAltText, metaTitle, metaDescription, metaKeywords, faqs };
        if (JSON.stringify(translatableData) === snapshot) {
          alert("No translation changes detected. Save aborted to protect the automatic English fallback.");
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        title, slug, content, excerpt, category, tags,
        featuredImage, imageAltText, isPublished,
        readingTime: readingTime ? Number(readingTime) : null,
        metaTitle, metaDescription, metaKeywords, faqs, authorName,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : (isPublished ? new Date().toISOString() : null),
        languageCode: activeLang
      };

      const path = isEditMode ? `/blogs/${editId}` : `/blogs`;
      const method = isEditMode ? "PUT" : "POST";

      const { ok, error } = await apiFetch(path, {
        method,
        token: getAdminToken(),
        body: JSON.stringify(payload)
      });

      if (ok) {
        if (activeLang === 'en') {
          router.push("/admin/blogs");
        } else {
          alert(`${activeLang.toUpperCase()} Translation Saved Successfully!`);
          setSnapshot(JSON.stringify({ title, slug, content, excerpt, category, tags, imageAltText, metaTitle, metaDescription, metaKeywords, faqs }));
        }
      } else {
        setError(error || "Failed to save post");
      }
    } catch (err) {
      setError("Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading editor...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-[1400px] mx-auto">
      <Link href="/admin/blogs" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group">
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Blogs
      </Link>
      
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
            {isEditMode ? "Edit Article" : "Write New Article"}
          </h2>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* CLEAR TRANSLATION BUTTON */}
          {activeLang !== 'en' && isEditMode && (
            <button 
              type="button" 
              onClick={async () => {
                if (!window.confirm(`Are you sure you want to delete the ${activeLang.toUpperCase()} translation?`)) return;
                setIsLoading(true);
                await apiFetch(`/blogs/${editId}/translations/${activeLang}`, {
                  method: "DELETE",
                  token: getAdminToken()
                });
                alert("Translation deleted. Reloading fallback text...");
                handleLanguageSwitch(activeLang);
              }}
              className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors border border-red-100 text-sm w-full sm:w-auto"
            >
              Clear Translation
            </button>
          )}

          <button 
            type="submit" disabled={isSaving}
            className="px-8 py-3 bg-[#135D66] hover:bg-[#0e4850] text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : (activeLang !== 'en' ? `Save ${activeLang.toUpperCase()}` : (isPublished ? "Update Post" : "Save Draft"))}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* LANGUAGE TABS */}
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

      {/* --- BANNER IMAGE SECTION --- */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#E59A1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
          Blog Banner Image
        </h3>
        
        <div className="relative w-full h-64 md:h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex flex-col items-center justify-center">
          {/* Protect image upload if not English */}
          {activeLang !== 'en' && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-[#E59A1D] border border-orange-100 text-sm">Image Upload Managed in English Tab</span>
            </div>
          )}

          {featuredImage ? (
             <img src={featuredImage} alt="Banner Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-6 text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <p className="font-bold text-gray-700">Upload banner</p>
            </div>
          )}
          
          <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={activeLang !== 'en'} />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image Alt Text (Translatable)</label>
          <input 
            type="text" placeholder="Describe the image..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-gray-900 bg-gray-50 focus:bg-white"
            value={imageAltText} onChange={(e) => setImageAltText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT COLUMN --- */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Article Title *</label>
              <input 
                type="text" required
                className="w-full px-4 py-4 text-xl font-bold border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-[#135D66] outline-none text-gray-900"
                value={title} onChange={handleTitleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {activeLang !== 'en' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                  <span className="bg-white px-3 py-1 rounded shadow-sm font-bold text-[#E59A1D] text-xs">Author Managed in English Tab</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Author Name</label>
                <input 
                  type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900"
                  value={authorName} onChange={(e) => setAuthorName(e.target.value)} disabled={activeLang !== 'en'}
                />
              </div>
              <div>
                {/* Category is translatable! */}
                <label className="block text-sm font-bold text-gray-700 mb-2 z-20 relative">Category</label>
                <input 
                  type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-[#135D66] relative z-20"
                  value={category} onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="quill-wrapper relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Article Content *</label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-300 focus-within:border-[#135D66] transition-all">
                 <style dangerouslySetInnerHTML={{__html: `
                   .quill-wrapper .ql-container { font-size: 1.05rem; min-height: 500px; height: auto; }
                   .quill-wrapper .ql-editor { min-height: 500px; color: #111827; padding: 1.5rem; line-height: 1.8; }
                   .quill-wrapper .ql-editor.ql-blank::before { color: #9ca3af; }
                   .quill-wrapper .ql-toolbar { border-bottom: 1px solid #e5e7eb; background: #f9fafb; padding: 12px; }
                   .quill-wrapper .ql-editor blockquote { border-left: 4px solid #135D66; background: #F0F9FA; padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; border-radius: 0 0.5rem 0.5rem 0; }
                   .quill-wrapper .ql-toolbar button.ql-divider::after { content: "—"; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 900; font-size: 18px; }
                   .quill-wrapper .ql-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
                   .quill-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
                 `}} />
                <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} modules={modules} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt (Translatable)</label>
              <textarea 
                rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-[#135D66] outline-none text-gray-900 resize-none"
                value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
              <button type="button" onClick={addFaq} className="px-4 py-2 bg-[#E9F4F5] text-[#135D66] font-bold text-sm rounded-lg hover:bg-[#135D66] hover:text-white transition-colors">
                + Add FAQ
              </button>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 relative group">
                  <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  <div className="space-y-3 pr-6">
                    <input type="text" placeholder="Question..." className="w-full px-4 py-2 border rounded-lg text-gray-900 font-bold" value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} />
                    <textarea rows={2} placeholder="Answer..." className="w-full px-4 py-2 border rounded-lg text-gray-900 resize-none" value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="w-full lg:w-1/3 space-y-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 relative">
            {activeLang !== 'en' && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                 <span className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-[#E59A1D] border border-orange-100 text-sm text-center">Publishing Settings Managed <br/> in English Tab</span>
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Publishing Status</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm font-bold text-gray-700">Visibility</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} disabled={activeLang !== 'en'} />
                <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-[#98D80D]"></div>
                <span className={`ml-3 text-sm font-bold ${isPublished ? 'text-[#135D66]' : 'text-gray-500'}`}>{isPublished ? 'Published' : 'Draft'}</span>
              </label>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Override Publish Date</label>
               <input type="datetime-local" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} disabled={activeLang !== 'en'} />
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Est. Reading Time (Mins)</label>
               <input type="number" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900" value={readingTime} onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")} disabled={activeLang !== 'en'} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Tags</h3>
              {activeLang !== 'en' && <span className="text-xs font-bold text-[#E59A1D] bg-orange-50 px-2 py-1 rounded">Translatable</span>}
            </div>
            
            <div className="flex gap-2 mb-5">
              <input 
                type="text" placeholder="Add a tag and press Enter..." className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white"
                value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
              />
              <button type="button" onClick={handleAddTag} className="px-5 py-3 bg-[#135D66] hover:bg-[#0e4850] text-white rounded-xl font-bold text-sm shadow-sm">Add</button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#E9F4F5] text-[#135D66] border border-[#135D66]/20">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 hover:bg-white rounded-full p-0.5 focus:outline-none"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Search Engine Optimization</h3>
              {activeLang !== 'en' && <span className="text-xs font-bold text-[#E59A1D] bg-orange-50 px-2 py-1 rounded">Localized SEO</span>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
              <div className="flex items-stretch">
                <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-500 text-sm font-medium flex items-center">
                  {activeLang === 'en' ? '/blogs/' : `/${activeLang}/blogs/`}
                </span>
                <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-r-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
              <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white resize-none" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta Keywords</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] text-sm text-gray-900 bg-gray-50 focus:bg-white" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}

export default function BlogEditorPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center pt-32 text-gray-500">
           <div className="w-12 h-12 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-4"></div>
           <p className="font-bold">Loading Editor Tools...</p>
        </div>
      }>
        <EditorForm />
      </Suspense>
    </div>
  );
}
// // apps/web/app/blogs/[slug]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { FaSearch, FaFacebookF, FaTwitter, FaLinkedinIn, FaLink } from "react-icons/fa";
// import ContactHero from "../../../../components/blogs/ContactHero"; // 1. Imported ContactHero

// interface Blog {
//   id: string;
//   slug: string;
//   title: string;
//   content: string;
//   excerpt: string;
//   featuredImage: string;
//   authorName: string;
//   category: string;
//   tags: string[];
//   publishedAt: string;
//   readingTime: number;
// }

// export default function BlogPostPage() {
//   const params = useParams();
//   const router = useRouter();
//   const slug = params.slug as string;

//   const [blog, setBlog] = useState<Blog | null>(null);
//   const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
//   const [topCategories, setTopCategories] = useState<{ category: string; count: number }[]>([]);
//   const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  
//   // Navigation State
//   const [prevPost, setPrevPost] = useState<Blog | null>(null);
//   const [nextPost, setNextPost] = useState<Blog | null>(null);
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");

//   // --- FETCH DATA ON MOUNT ---
//   useEffect(() => {
//     if (!slug) return;

//     const fetchAllData = async () => {
//       try {
//         const [blogRes, recentRes, categoriesRes, tagsRes] = await Promise.all([
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/${slug}`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs?publishedOnly=true`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-categories`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-tags`),
//         ]);

//         const blogData = await blogRes.json();
//         const recentData = await recentRes.json();
//         const catsData = await categoriesRes.json();
//         const tagsData = await tagsRes.json();

//         if (blogData.status === "success") {
//           setBlog(blogData.data);
//         } else {
//           router.push("/blogs"); // Redirect if not found
//           return;
//         }
        
//         if (recentData.status === "success") {
//           const allPublished = recentData.data;
          
//           // Filter out the current post from recent posts for the sidebar
//           const filteredRecent = allPublished.filter((b: Blog) => b.slug !== slug).slice(0, 4);
//           setRecentPosts(filteredRecent);

//           // Find current index to determine Prev/Next posts
//           const currentIndex = allPublished.findIndex((b: Blog) => b.slug === slug);
//           if (currentIndex !== -1) {
//             // Because the list is sorted newest -> oldest:
//             // The item BEFORE it in the array is newer (Next Post)
//             setNextPost(currentIndex > 0 ? allPublished[currentIndex - 1] : null);
            
//             // The item AFTER it in the array is older (Previous Post)
//             setPrevPost(currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1] : null);
//           }
//         }

//         if (catsData.status === "success") setTopCategories(catsData.data);
//         if (tagsData.status === "success") setTopTags(tagsData.data);

//       } catch (error) {
//         console.error("Failed to fetch blog data", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllData();
//   }, [slug, router]);

//   // --- SEARCH HANDLER ---
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       router.push(`/blogs`); 
//     }
//   };

//   // --- DATE FORMATTERS ---
//   const formatFullDate = (isoString: string) => {
//     if (!isoString) return "Unknown Date";
//     const date = new Date(isoString);
//     return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
//   };
  
//   const formatDateForBadge = (isoString: string) => {
//     if (!isoString) return { day: "00", month: "JAN" };
//     const date = new Date(isoString);
//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
//     return { day, month };
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(window.location.href);
//     alert("Link copied to clipboard!");
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFEFE] pt-32 pb-40">
//         <div className="w-16 h-16 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-6"></div>
//         <p className="text-[#135D66] font-bold text-xl animate-pulse">Loading article...</p>
//       </div>
//     );
//   }

//   if (!blog) return null;

//   return (
//     <div className="min-h-screen bg-[#FDFEFE] pt-30 pb-24 relative overflow-hidden -mt-[120px] z-0">
      
//       {/* --- CUSTOM CSS ANIMATIONS & RICH TEXT STYLING --- */}
//       <style dangerouslySetInnerHTML={{
//         __html: `
//           @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
//           @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
//           @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          
//           .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
//           .animate-fade-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
//           .animate-fade-left { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

//           /* QUILL RICH TEXT STYLING */
//           .blog-content { 
//             color: #4B5563; 
//             line-height: 1.8; 
//             font-size: 1.05rem; 
//             /* THE FIX: Wrap long URLs safely, but keep normal words intact */
//             overflow-wrap: break-word;
//             word-break: normal;
//             max-width: 100%;
//           }
//           .blog-content p { margin-bottom: 1.5rem; }
//           .blog-content h1, .blog-content h2, .blog-content h3 { color: #135D66; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1.25rem; line-height: 1.3; }
//           .blog-content h2 { font-size: 1.875rem; }
//           .blog-content h3 { font-size: 1.5rem; }
//           .blog-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
//           .blog-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.5rem; }
//           .blog-content li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
//           .blog-content img { border-radius: 1rem; margin: 2rem 0; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
//           .blog-content a { color: #E59A1D; text-decoration: underline; font-weight: 600; }
//           .blog-content pre, .blog-content code { white-space: pre-wrap; max-width: 100%; overflow-x: auto; }
          
//           /* Custom Blockquote */
//           .blog-content blockquote {
//             position: relative;
//             padding: 1.5rem 2rem 1.5rem 4rem;
//             margin: 2.5rem 0;
//             background: #F9FAFB;
//             border-left: 4px solid #E59A1D;
//             font-size: 1.15rem;
//             font-style: italic;
//             font-weight: 600;
//             color: #135D66;
//             border-radius: 0 1rem 1rem 0;
//           }
//           .blog-content blockquote::before {
//             content: "\\201C";
//             position: absolute;
//             left: 0.5rem;
//             top: -0.5rem;
//             font-size: 5rem;
//             color: #E59A1D;
//             font-family: Georgia, serif;
//             line-height: 1;
//             opacity: 0.8;
//           }
//         `
//       }} />

//       {/* --- PAGE HEADER (Now using ContactHero) --- */}
//       <div className="mb-16 -mt-[120px]">
//         <ContactHero />
//       </div>

//       {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
//       <div className="max-w-[1350px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-20 pt-10">
        
//         {/* ========================================== */}
//         {/* LEFT COLUMN: FULL BLOG POST                */}
//         {/* ========================================== */}
//         <div className="w-full lg:w-[65%] xl:w-[70%] max-w-full overflow-hidden">
          
//           {/* 1. Featured Image */}
//           <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] rounded-[30px] overflow-hidden shadow-lg mb-10 animate-fade-up">
//             <Image 
//               src={blog.featuredImage || "/placeholder-blog.jpg"} 
//               alt={blog.title} 
//               fill 
//               unoptimized
//               className="object-cover"
//               priority
//             />
//           </div>

//           {/* 2. Meta Info */}
//           <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider animate-fade-up" style={{ animationDelay: '0.1s' }}>
//             <span className="text-[#135D66]">By {blog.authorName || "Habari Team"}</span>
//             <span className="text-gray-300">/</span>
//             <span>{formatFullDate(blog.publishedAt)}</span>
//             <span className="text-gray-300">/</span>
//             <span className="text-[#E59A1D]">{blog.category || "General"}</span>
//           </div>

//           {/* 3. Title */}
//           <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#135D66] leading-tight mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
//             {blog.title}
//           </h1>

//           {/* 4. Rich Text Content (Injected Quill HTML) */}
//           <div 
//             className="blog-content animate-fade-up" 
//             style={{ animationDelay: '0.3s' }}
//             dangerouslySetInnerHTML={{ __html: blog.content }} 
//           />

//           {/* 5. Bottom Section: Tags & Social Share */}
//           <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            
//             {/* Tags */}
//             <div className="flex items-center gap-4 flex-wrap">
//               <span className="font-extrabold text-[#135D66]">Tags:</span>
//               <div className="flex gap-2 flex-wrap">
//                 {blog.tags && blog.tags.length > 0 ? (
//                   blog.tags.map((tag, idx) => (
//                     <Link key={idx} href="/blogs" className="bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#135D66] hover:text-white transition-colors">
//                       {tag}
//                     </Link>
//                   ))
//                 ) : (
//                   <span className="text-sm text-gray-400">No tags</span>
//                 )}
//               </div>
//             </div>

//             {/* Social Share Buttons */}
//             <div className="flex items-center gap-3">
//               <span className="font-extrabold text-[#135D66] mr-2">Share:</span>
//               <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
//                 <FaFacebookF />
//               </button>
//               <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
//                 <FaTwitter />
//               </button>
//               <button onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
//                 <FaLinkedinIn />
//               </button>
//               <button onClick={copyToClipboard} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
//                 <FaLink />
//               </button>
//             </div>
//           </div>

//           {/* 6. Dynamic Post Navigation */}
//           <div className="mt-12 flex justify-between items-start border-t border-gray-100 pt-8 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            
//             {/* Previous Post (Older) */}
//             {prevPost ? (
//               <Link href={`/blogs/${prevPost.slug}`} className="group flex flex-col items-start max-w-[45%] text-left">
//                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[#E59A1D] transition-colors flex items-center gap-2">
//                   <span>←</span> Previous Post
//                 </span>
//                 <span className="text-sm md:text-base font-bold text-[#135D66] line-clamp-2 leading-snug group-hover:text-[#E59A1D] transition-colors">
//                   {prevPost.title}
//                 </span>
//               </Link>
//             ) : <div className="max-w-[45%]"></div>}

//             {/* Next Post (Newer) */}
//             {nextPost ? (
//               <Link href={`/blogs/${nextPost.slug}`} className="group flex flex-col items-end max-w-[45%] text-right">
//                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[#E59A1D] transition-colors flex items-center gap-2">
//                   Next Post <span>→</span>
//                 </span>
//                 <span className="text-sm md:text-base font-bold text-[#135D66] line-clamp-2 leading-snug group-hover:text-[#E59A1D] transition-colors">
//                   {nextPost.title}
//                 </span>
//               </Link>
//             ) : <div className="max-w-[45%]"></div>}

//           </div>

//         </div>

//         {/* ========================================== */}
//         {/* RIGHT COLUMN: SIDEBAR WIDGETS              */}
//         {/* ========================================== */}
//         <div className="w-full lg:w-[35%] xl:w-[30%] space-y-10 animate-fade-left mt-10 lg:mt-0">
          
//           {/* SEARCH WIDGET */}
//           <form onSubmit={handleSearch} className="relative shadow-sm rounded-full overflow-hidden border border-gray-200 bg-white group focus-within:border-[#135D66] focus-within:ring-2 focus-within:ring-[#135D66]/20 transition-all">
//             <input 
//               type="text" 
//               placeholder="Search..." 
//               className="w-full py-4 pl-6 pr-14 text-gray-700 outline-none text-sm font-medium bg-transparent"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <button type="submit" className="absolute right-0 top-0 h-full px-5 text-gray-400 group-focus-within:text-[#135D66] transition-colors">
//               <FaSearch />
//             </button>
//           </form>

//           {/* RECENT POSTS WIDGET */}
//           <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
//             <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
//               Recent Posts
//             </h3>
//             <div className="space-y-0">
//               {recentPosts.map((post, index) => {
//                 const { day, month } = formatDateForBadge(post.publishedAt);
//                 return (
//                   <div key={post.id} className="relative">
//                     <Link href={`/blogs/${post.slug}`} className="flex gap-4 items-center group py-5">
//                       {/* Mini Date Box */}
//                       <div className="bg-[#135D66] text-white rounded-xl p-2 min-w-[55px] h-[55px] flex flex-col items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
//                         <span className="font-extrabold text-lg leading-none">{day}</span>
//                         <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">{month}</span>
//                       </div>
//                       {/* Title */}
//                       <h4 className="font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors leading-tight text-sm line-clamp-2">
//                         {post.title}
//                       </h4>
//                     </Link>
//                     {/* Dashed line matching UI */}
//                     {index < recentPosts.length - 1 && (
//                       <div className="w-full border-b border-dashed border-gray-300"></div>
//                     )}
//                   </div>
//                 )
//               })}
//               {recentPosts.length === 0 && <p className="text-sm text-gray-400 italic">No other posts yet.</p>}
//             </div>
//           </div>

//           {/* TOP DESTINATIONS / CATEGORIES WIDGET */}
//           <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
//             <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
//               Top Destinations
//             </h3>
//             <div className="space-y-4">
//               {topCategories.map((cat, idx) => (
//                 <Link 
//                   key={idx}
//                   href="/blogs"
//                   className="w-full flex justify-between items-center group py-1"
//                 >
//                   <span className="font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors">{cat.category}</span>
//                   <span className="text-gray-400 font-medium text-sm">( {cat.count.toString().padStart(2, '0')} Listing )</span>
//                 </Link>
//               ))}
//               {topCategories.length === 0 && <p className="text-sm text-gray-400 italic">No categories yet.</p>}
//             </div>
//           </div>

//           {/* POPULAR TAGS WIDGET */}
//           <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
//             <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
//               Popular Tags
//             </h3>
//             <div className="flex flex-wrap gap-3">
//               {topTags.map((t, idx) => (
//                 <Link 
//                   key={idx}
//                   href="/blogs"
//                   className="bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#135D66] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
//                 >
//                   {t.tag}
//                 </Link>
//               ))}
//               {topTags.length === 0 && <p className="text-sm text-gray-400 italic">No tags found.</p>}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }
// apps/web/app/[lang]/blogs/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaFacebookF, FaTwitter, FaLinkedinIn, FaLink } from "react-icons/fa";
import ContactHero from "../../../../components/blogs/ContactHero";

interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  authorName: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract lang from URL
  const lang = (params.lang as string) || "en";
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [topCategories, setTopCategories] = useState<{ category: string; count: number }[]>([]);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  
  const [prevPost, setPrevPost] = useState<Blog | null>(null);
  const [nextPost, setNextPost] = useState<Blog | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    if (!slug) return;

    const fetchAllData = async () => {
      try {
        // Appended ?lang=${lang} to all fetches
        const [blogRes, recentRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/${slug}?lang=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs?publishedOnly=true&lang=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-categories?lang=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-tags?lang=${lang}`),
        ]);

        const blogData = await blogRes.json();
        const recentData = await recentRes.json();
        const catsData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        if (blogData.status === "success") {
          setBlog(blogData.data);
        } else {
          router.push(`/${lang}/blogs`);
          return;
        }
        
        if (recentData.status === "success") {
          const allPublished = recentData.data;
          
          const filteredRecent = allPublished.filter((b: Blog) => b.slug !== slug).slice(0, 4);
          setRecentPosts(filteredRecent);

          const currentIndex = allPublished.findIndex((b: Blog) => b.slug === slug);
          if (currentIndex !== -1) {
            setNextPost(currentIndex > 0 ? allPublished[currentIndex - 1] : null);
            setPrevPost(currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1] : null);
          }
        }

        if (catsData.status === "success") setTopCategories(catsData.data);
        if (tagsData.status === "success") setTopTags(tagsData.data);

      } catch (error) {
        console.error("Failed to fetch blog data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [slug, router, lang]);

  // --- SEARCH HANDLER ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Adjusted router push to retain language context
      router.push(`/${lang}/blogs`); 
    }
  };

  // --- DATE FORMATTERS ---
  const formatFullDate = (isoString: string) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  };
  
  const formatDateForBadge = (isoString: string) => {
    if (!isoString) return { day: "00", month: "JAN" };
    const date = new Date(isoString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
    return { day, month };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFEFE] pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-6"></div>
        <p className="text-[#135D66] font-bold text-xl animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-[#FDFEFE] pt-30 pb-24 relative overflow-hidden -mt-[120px] z-0">
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-fade-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-fade-left { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .blog-content { color: #4B5563; line-height: 1.8; font-size: 1.05rem; overflow-wrap: break-word; word-break: normal; max-width: 100%; }
          .blog-content p { margin-bottom: 1.5rem; }
          .blog-content h1, .blog-content h2, .blog-content h3 { color: #135D66; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1.25rem; line-height: 1.3; }
          .blog-content h2 { font-size: 1.875rem; }
          .blog-content h3 { font-size: 1.5rem; }
          .blog-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
          .blog-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.5rem; }
          .blog-content li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
          .blog-content img { border-radius: 1rem; margin: 2rem 0; max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .blog-content a { color: #E59A1D; text-decoration: underline; font-weight: 600; }
          .blog-content pre, .blog-content code { white-space: pre-wrap; max-width: 100%; overflow-x: auto; }
          .blog-content blockquote { position: relative; padding: 1.5rem 2rem 1.5rem 4rem; margin: 2.5rem 0; background: #F9FAFB; border-left: 4px solid #E59A1D; font-size: 1.15rem; font-style: italic; font-weight: 600; color: #135D66; border-radius: 0 1rem 1rem 0; }
          .blog-content blockquote::before { content: "\\201C"; position: absolute; left: 0.5rem; top: -0.5rem; font-size: 5rem; color: #E59A1D; font-family: Georgia, serif; line-height: 1; opacity: 0.8; }
        `
      }} />

      <div className="mb-16 -mt-[120px]">
        <ContactHero />
      </div>

      <div className="max-w-[1350px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-20 pt-10">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: FULL BLOG POST                */}
        {/* ========================================== */}
        <div className="w-full lg:w-[65%] xl:w-[70%] max-w-full overflow-hidden">
          
          <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] rounded-[30px] overflow-hidden shadow-lg mb-10 animate-fade-up">
            <Image 
              src={blog.featuredImage || "/placeholder-blog.jpg"} 
              alt={blog.title} 
              fill 
              unoptimized
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {/* Added notranslate */}
            <span className="notranslate text-[#135D66]">By {blog.authorName || "Habari Team"}</span>
            <span className="text-gray-300">/</span>
            <span>{formatFullDate(blog.publishedAt)}</span>
            <span className="text-gray-300">/</span>
            {/* Added notranslate */}
            <span className="notranslate text-[#E59A1D]">{blog.category || "General"}</span>
          </div>

          {/* Added notranslate */}
          <h1 className="notranslate text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#135D66] leading-tight mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {blog.title}
          </h1>

          {/* Added notranslate */}
          <div 
            className="notranslate blog-content animate-fade-up" 
            style={{ animationDelay: '0.3s' }}
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />

          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-extrabold text-[#135D66]">Tags:</span>
              <div className="flex gap-2 flex-wrap">
                {blog.tags && blog.tags.length > 0 ? (
                  blog.tags.map((tag, idx) => (
                    // Updated link with dynamic lang, added notranslate
                    <Link key={idx} href={`/${lang}/blogs`} className="notranslate bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#135D66] hover:text-white transition-colors">
                      {tag}
                    </Link>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No tags</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-[#135D66] mr-2">Share:</span>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
                <FaFacebookF />
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
                <FaTwitter />
              </button>
              <button onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`, '_blank')} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
                <FaLinkedinIn />
              </button>
              <button onClick={copyToClipboard} className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center hover:bg-[#E59A1D] hover:-translate-y-1 transition-all shadow-md">
                <FaLink />
              </button>
            </div>
          </div>

          <div className="mt-12 flex justify-between items-start border-t border-gray-100 pt-8 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            
            {prevPost ? (
              // Updated link with dynamic lang
              <Link href={`/${lang}/blogs/${prevPost.slug}`} className="group flex flex-col items-start max-w-[45%] text-left">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[#E59A1D] transition-colors flex items-center gap-2">
                  <span>←</span> Previous Post
                </span>
                {/* Added notranslate */}
                <span className="notranslate text-sm md:text-base font-bold text-[#135D66] line-clamp-2 leading-snug group-hover:text-[#E59A1D] transition-colors">
                  {prevPost.title}
                </span>
              </Link>
            ) : <div className="max-w-[45%]"></div>}

            {nextPost ? (
              // Updated link with dynamic lang
              <Link href={`/${lang}/blogs/${nextPost.slug}`} className="group flex flex-col items-end max-w-[45%] text-right">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-[#E59A1D] transition-colors flex items-center gap-2">
                  Next Post <span>→</span>
                </span>
                {/* Added notranslate */}
                <span className="notranslate text-sm md:text-base font-bold text-[#135D66] line-clamp-2 leading-snug group-hover:text-[#E59A1D] transition-colors">
                  {nextPost.title}
                </span>
              </Link>
            ) : <div className="max-w-[45%]"></div>}

          </div>

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SIDEBAR WIDGETS              */}
        {/* ========================================== */}
        <div className="w-full lg:w-[35%] xl:w-[30%] space-y-10 animate-fade-left mt-10 lg:mt-0">
          
          <form onSubmit={handleSearch} className="relative shadow-sm rounded-full overflow-hidden border border-gray-200 bg-white group focus-within:border-[#135D66] focus-within:ring-2 focus-within:ring-[#135D66]/20 transition-all">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full py-4 pl-6 pr-14 text-gray-700 outline-none text-sm font-medium bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-5 text-gray-400 group-focus-within:text-[#135D66] transition-colors">
              <FaSearch />
            </button>
          </form>

          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
              Recent Posts
            </h3>
            <div className="space-y-0">
              {recentPosts.map((post, index) => {
                const { day, month } = formatDateForBadge(post.publishedAt);
                return (
                  <div key={post.id} className="relative">
                    {/* Updated link with dynamic lang */}
                    <Link href={`/${lang}/blogs/${post.slug}`} className="flex gap-4 items-center group py-5">
                      <div className="bg-[#135D66] text-white rounded-xl p-2 min-w-[55px] h-[55px] flex flex-col items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
                        <span className="font-extrabold text-lg leading-none">{day}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">{month}</span>
                      </div>
                      {/* Added notranslate */}
                      <h4 className="notranslate font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors leading-tight text-sm line-clamp-2">
                        {post.title}
                      </h4>
                    </Link>
                    {index < recentPosts.length - 1 && (
                      <div className="w-full border-b border-dashed border-gray-300"></div>
                    )}
                  </div>
                )
              })}
              {recentPosts.length === 0 && <p className="text-sm text-gray-400 italic">No other posts yet.</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
              Top Categories
            </h3>
            <div className="space-y-4">
              {topCategories.map((cat, idx) => (
                <Link 
                  key={idx}
                  href={`/${lang}/blogs`}
                  className="w-full flex justify-between items-center group py-1"
                >
                  {/* Added notranslate */}
                  <span className="notranslate font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors">{cat.category}</span>
                  <span className="text-gray-400 font-medium text-sm">( {cat.count.toString().padStart(2, '0')} )</span>
                </Link>
              ))}
              {topCategories.length === 0 && <p className="text-sm text-gray-400 italic">No categories yet.</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-3">
              {topTags.map((t, idx) => (
                <Link 
                  key={idx}
                  href={`/${lang}/blogs`}
                  // Added notranslate
                  className="notranslate bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#135D66] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {t.tag}
                </Link>
              ))}
              {topTags.length === 0 && <p className="text-sm text-gray-400 italic">No tags found.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
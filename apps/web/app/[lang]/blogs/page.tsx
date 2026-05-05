// // apps/web/app/blogs/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { FaSearch } from "react-icons/fa";
// import ContactHero from "../../../components/blogs/ContactHero"; // 1. Imported ContactHero

// interface Blog {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string;
//   featuredImage: string;
//   authorName: string;
//   category: string;
//   tags: string[];
//   publishedAt: string;
// }

// export default function BlogsListingPage() {
//   const [blogs, setBlogs] = useState<Blog[]>([]);
//   const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
//   const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
//   const [topCategories, setTopCategories] = useState<{ category: string; count: number }[]>([]);
//   const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);

//   // --- PAGINATION STATE ---
//   const [currentPage, setCurrentPage] = useState(1);
//   const POSTS_PER_PAGE = 6;

//   // --- FETCH DATA ON MOUNT ---
//   useEffect(() => {
//     const fetchBlogData = async () => {
//       try {
//         const [blogsRes, categoriesRes, tagsRes] = await Promise.all([
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs?publishedOnly=true`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-categories`),
//           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-tags`),
//         ]);

//         const blogsData = await blogsRes.json();
//         const catsData = await categoriesRes.json();
//         const tagsData = await tagsRes.json();

//         if (blogsData.status === "success") {
//           const allBlogs = blogsData.data;
//           setBlogs(allBlogs);
//           setDisplayedBlogs(allBlogs);
//           setRecentPosts(allBlogs.slice(0, 5)); // 3. Grab up to 5 latest posts
//         }
//         if (catsData.status === "success") setTopCategories(catsData.data);
//         if (tagsData.status === "success") setTopTags(tagsData.data);
//       } catch (error) {
//         console.error("Failed to fetch blog data", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBlogData();
//   }, []);

//   // --- SEARCH & FILTER LOGIC ---
//   useEffect(() => {
//     let filtered = [...blogs];

//     if (activeFilter) {
//       if (activeFilter.type === "category") {
//         filtered = filtered.filter(b => b.category?.toLowerCase() === activeFilter.value.toLowerCase());
//       } else if (activeFilter.type === "tag") {
//         filtered = filtered.filter(b => b.tags?.includes(activeFilter.value));
//       }
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(b => 
//         b.title.toLowerCase().includes(q) || 
//         b.category?.toLowerCase().includes(q) ||
//         b.tags?.some(t => t.toLowerCase().includes(q))
//       );
//     }

//     setDisplayedBlogs(filtered);
//     setCurrentPage(1); // Reset to page 1 whenever filters change
//   }, [searchQuery, activeFilter, blogs]);

//   // --- PAGINATION CALCULATION ---
//   const totalPages = Math.ceil(displayedBlogs.length / POSTS_PER_PAGE);
//   const paginatedBlogs = displayedBlogs.slice(
//     (currentPage - 1) * POSTS_PER_PAGE, 
//     currentPage * POSTS_PER_PAGE
//   );

//   // --- 2. FIXED DATE FORMATTER (Force UTC) ---
//   const formatDateForBadge = (isoString: string) => {
//     if (!isoString) return { day: "00", month: "JAN" };
//     const date = new Date(isoString);
    
//     // getUTCDate() ignores the browser's timezone so the day won't shift backwards
//     const day = date.getUTCDate().toString().padStart(2, "0");
//     const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
    
//     return { day, month };
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFEFE] pt-32 pb-40">
//         <div className="w-16 h-16 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-6"></div>
//         <p className="text-[#135D66] font-bold text-xl animate-pulse">Loading amazing stories...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#FDFEFE] pb-24 relative">
      
//       {/* --- CUSTOM CSS ANIMATIONS --- */}
//       <style dangerouslySetInnerHTML={{
//         __html: `
//           @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
//           @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
//           @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          
//           .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
//           .animate-fade-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
//           .animate-fade-left { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
//         `
//       }} />

//       {/* --- PAGE HEADER (Now using ContactHero) --- */}
//       <div className="mb-16 -mt-[120px]">
//         <ContactHero />
//       </div>

//       {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
//       <div className="max-w-[1350px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-14 relative z-20">
        
//         {/* ========================================== */}
//         {/* LEFT COLUMN: BLOG GRID                     */}
//         {/* ========================================== */}
//         <div className="w-full lg:w-[65%] xl:w-[70%]">
          
//           {/* Active Filter Pill */}
//           {activeFilter && (
//             <div className="mb-6 flex items-center gap-3 animate-fade-right">
//               <span className="text-gray-500 font-medium">Showing results for {activeFilter.type}:</span>
//               <span className="bg-[#135D66] text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-md">
//                 {activeFilter.value}
//                 <button onClick={() => setActiveFilter(null)} className="hover:text-red-300 ml-1">✕</button>
//               </span>
//             </div>
//           )}

//           {displayedBlogs.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 animate-fade-up">
//               <span className="text-5xl mb-4 block">🏜️</span>
//               <h3 className="text-2xl font-bold text-[#135D66] mb-2">No adventures found!</h3>
//               <p className="text-gray-500">Try searching for something else or clear your filters.</p>
//               <button onClick={() => { setSearchQuery(""); setActiveFilter(null); }} className="mt-6 px-6 py-2 bg-[#E59A1D] text-white font-bold rounded-full hover:-translate-y-1 transition-transform">
//                 Clear All Filters
//               </button>
//             </div>
//           ) : (
//             <>
//               {/* Blog Grid rendering paginatedBlogs instead of all displayedBlogs */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {paginatedBlogs.map((blog, idx) => {
//                   const { day, month } = formatDateForBadge(blog.publishedAt);
//                   return (
//                     <Link 
//                       href={`/blogs/${blog.slug}`} 
//                       key={blog.id}
//                       className="group relative h-[420px] w-full rounded-[30px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block animate-fade-up"
//                       style={{ animationDelay: `${idx * 0.1}s` }}
//                     >
//                       {/* Background Image */}
//                       <div className="absolute inset-0 bg-gray-200">
//                         {/* 2. FIXED: Added 'unoptimized' to bypass Next.js Strict Image Config for external URLs */}
//                         <Image 
//                           src={blog.featuredImage || "/placeholder-blog.jpg"} 
//                           alt={blog.title} 
//                           fill 
//                           unoptimized
//                           className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
//                         />
//                       </div>
                      
//                       {/* Dark Gradient Overlay */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:opacity-90"></div>

//                       {/* Date Badge (Top Right) */}
//                       <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm shadow-md rounded-xl p-2 min-w-[65px] flex flex-col items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300 z-10">
//                         <span className="text-[#135D66] font-extrabold text-2xl leading-none">{day}</span>
//                         <span className="text-[#135D66] font-bold text-[10px] uppercase tracking-widest mt-1">{month}</span>
//                       </div>

//                       {/* Content (Bottom) */}
//                       <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex flex-col justify-end">
//                         <span className="text-[#E59A1D] font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
//                           By {blog.authorName || "Habari Team"}
//                         </span>
//                         <h2 className="text-white text-2xl md:text-3xl font-bold leading-snug group-hover:text-[#E9F4F5] transition-colors line-clamp-3">
//                           {blog.title}
//                         </h2>
//                       </div>
//                     </Link>
//                   )
//                 })}
//               </div>

//               {/* --- 4. PAGINATION CONTROLS --- */}
//               {totalPages > 1 && (
//                 <div className="flex items-center justify-center gap-2 mt-16 animate-fade-up">
//                   {/* Previous Button */}
//                   <button 
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#135D66] hover:text-[#135D66] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors font-bold"
//                   >
//                     {"<"}
//                   </button>

//                   {/* Page Numbers */}
//                   {Array.from({ length: totalPages }).map((_, i) => {
//                     const pageNumber = i + 1;
//                     return (
//                       <button 
//                         key={pageNumber}
//                         onClick={() => setCurrentPage(pageNumber)}
//                         className={`w-10 h-10 rounded-full font-bold transition-colors ${
//                           currentPage === pageNumber 
//                             ? "bg-[#135D66] text-white shadow-md" 
//                             : "text-[#135D66] hover:bg-gray-100"
//                         }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     );
//                   })}

//                   {/* Next Button */}
//                   <button 
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#135D66] hover:text-[#135D66] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors font-bold"
//                   >
//                     {">"}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}

//         </div>

//         {/* ========================================== */}
//         {/* RIGHT COLUMN: SIDEBAR WIDGETS              */}
//         {/* ========================================== */}
//         <div className="w-full lg:w-[35%] xl:w-[30%] space-y-10 animate-fade-left mt-10 lg:mt-0">
          
//           {/* SEARCH WIDGET */}
//           <div className="relative shadow-sm rounded-full overflow-hidden border border-gray-200 bg-white group focus-within:border-[#135D66] focus-within:ring-2 focus-within:ring-[#135D66]/20 transition-all">
//             <input 
//               type="text" 
//               placeholder="Search..." 
//               className="w-full py-4 pl-6 pr-14 text-gray-700 outline-none text-sm font-medium bg-transparent"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <button className="absolute right-0 top-0 h-full px-5 text-gray-400 group-focus-within:text-[#135D66] transition-colors">
//               <FaSearch />
//             </button>
//           </div>

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
//                       <h4 className="font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors leading-tight text-sm">
//                         {post.title}
//                       </h4>
//                     </Link>
//                     {/* Dashed line matching UI (don't show on last item) */}
//                     {index < recentPosts.length - 1 && (
//                       <div className="w-full border-b border-dashed border-gray-300"></div>
//                     )}
//                   </div>
//                 )
//               })}
//               {recentPosts.length === 0 && <p className="text-sm text-gray-400 italic">No posts yet.</p>}
//             </div>
//           </div>

//           {/* TOP DESTINATIONS / CATEGORIES WIDGET */}
//           <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
//             <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
//               Top Destinations
//             </h3>
//             <div className="space-y-4">
//               {topCategories.map((cat, idx) => (
//                 <button 
//                   key={idx}
//                   onClick={() => setActiveFilter({ type: "category", value: cat.category })}
//                   className="w-full flex justify-between items-center group py-1"
//                 >
//                   <span className="font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors">{cat.category}</span>
//                   <span className="text-gray-400 font-medium text-sm">( {cat.count.toString().padStart(2, '0')} Listing )</span>
//                 </button>
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
//                 <button 
//                   key={idx}
//                   onClick={() => setActiveFilter({ type: "tag", value: t.tag })}
//                   className="bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#135D66] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
//                 >
//                   {t.tag}
//                 </button>
//               ))}
//               {topTags.length === 0 && <p className="text-sm text-gray-400 italic">No tags found.</p>}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }
// apps/web/app/[lang]/blogs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import ContactHero from "../../../components/blogs/ContactHero"; 

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  authorName: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export default function BlogsListingPage() {
  const params = useParams();
  const lang = (params.lang as string) || "en"; // Extract language

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [topCategories, setTopCategories] = useState<{ category: string; count: number }[]>([]);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // Appended &lang=${lang} or ?lang=${lang} to all fetches
        const [blogsRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs?publishedOnly=true&lang=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-categories?lang=${lang}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/stats/top-tags?lang=${lang}`),
        ]);

        const blogsData = await blogsRes.json();
        const catsData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        if (blogsData.status === "success") {
          const allBlogs = blogsData.data;
          setBlogs(allBlogs);
          setDisplayedBlogs(allBlogs);
          setRecentPosts(allBlogs.slice(0, 5));
        }
        if (catsData.status === "success") setTopCategories(catsData.data);
        if (tagsData.status === "success") setTopTags(tagsData.data);
      } catch (error) {
        console.error("Failed to fetch blog data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, [lang]);

  // --- SEARCH & FILTER LOGIC ---
  useEffect(() => {
    let filtered = [...blogs];

    if (activeFilter) {
      if (activeFilter.type === "category") {
        filtered = filtered.filter(b => b.category?.toLowerCase() === activeFilter.value.toLowerCase());
      } else if (activeFilter.type === "tag") {
        filtered = filtered.filter(b => b.tags?.includes(activeFilter.value));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.category?.toLowerCase().includes(q) ||
        b.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    setDisplayedBlogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, activeFilter, blogs]);

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(displayedBlogs.length / POSTS_PER_PAGE);
  const paginatedBlogs = displayedBlogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE, 
    currentPage * POSTS_PER_PAGE
  );

  // --- FIXED DATE FORMATTER ---
  const formatDateForBadge = (isoString: string) => {
    if (!isoString) return { day: "00", month: "JAN" };
    const date = new Date(isoString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase();
    return { day, month };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFEFE] pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-6"></div>
        <p className="text-[#135D66] font-bold text-xl animate-pulse">Loading amazing stories...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFE] pb-24 relative">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          .animate-fade-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-fade-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-fade-left { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        `
      }} />

      <div className="mb-16 -mt-[120px]">
        <ContactHero />
      </div>

      <div className="max-w-[1350px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-14 relative z-20">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: BLOG GRID                     */}
        {/* ========================================== */}
        <div className="w-full lg:w-[65%] xl:w-[70%]">
          
          {activeFilter && (
            <div className="mb-6 flex items-center gap-3 animate-fade-right">
              <span className="text-gray-500 font-medium">Showing results for {activeFilter.type}:</span>
              {/* Added notranslate to the dynamic active filter value */}
              <span className="notranslate bg-[#135D66] text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-md">
                {activeFilter.value}
                <button onClick={() => setActiveFilter(null)} className="hover:text-red-300 ml-1">✕</button>
              </span>
            </div>
          )}

          {displayedBlogs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 animate-fade-up">
              <span className="text-5xl mb-4 block">🏜️</span>
              <h3 className="text-2xl font-bold text-[#135D66] mb-2">No adventures found!</h3>
              <p className="text-gray-500">Try searching for something else or clear your filters.</p>
              <button onClick={() => { setSearchQuery(""); setActiveFilter(null); }} className="mt-6 px-6 py-2 bg-[#E59A1D] text-white font-bold rounded-full hover:-translate-y-1 transition-transform">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {paginatedBlogs.map((blog, idx) => {
                  const { day, month } = formatDateForBadge(blog.publishedAt);
                  return (
                    // Updated link with dynamic lang
                    <Link 
                      href={`/${lang}/blogs/${blog.slug}`} 
                      key={blog.id}
                      className="group relative h-[420px] w-full rounded-[30px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block animate-fade-up"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="absolute inset-0 bg-gray-200">
                        <Image 
                          src={blog.featuredImage || "/placeholder-blog.jpg"} 
                          alt={blog.title} 
                          fill 
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:opacity-90"></div>

                      <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm shadow-md rounded-xl p-2 min-w-[65px] flex flex-col items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300 z-10">
                        <span className="text-[#135D66] font-extrabold text-2xl leading-none">{day}</span>
                        <span className="text-[#135D66] font-bold text-[10px] uppercase tracking-widest mt-1">{month}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex flex-col justify-end">
                        {/* notranslate added to author */}
                        <span className="notranslate text-[#E59A1D] font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                          By {blog.authorName || "Habari Team"}
                        </span>
                        {/* notranslate added to title */}
                        <h2 className="notranslate text-white text-2xl md:text-3xl font-bold leading-snug group-hover:text-[#E9F4F5] transition-colors line-clamp-3">
                          {blog.title}
                        </h2>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-16 animate-fade-up">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#135D66] hover:text-[#135D66] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors font-bold"
                  >
                    {"<"}
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button 
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 rounded-full font-bold transition-colors ${
                          currentPage === pageNumber 
                            ? "bg-[#135D66] text-white shadow-md" 
                            : "text-[#135D66] hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#135D66] hover:text-[#135D66] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors font-bold"
                  >
                    {">"}
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SIDEBAR WIDGETS              */}
        {/* ========================================== */}
        <div className="w-full lg:w-[35%] xl:w-[30%] space-y-10 animate-fade-left mt-10 lg:mt-0">
          
          <div className="relative shadow-sm rounded-full overflow-hidden border border-gray-200 bg-white group focus-within:border-[#135D66] focus-within:ring-2 focus-within:ring-[#135D66]/20 transition-all">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full py-4 pl-6 pr-14 text-gray-700 outline-none text-sm font-medium bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full px-5 text-gray-400 group-focus-within:text-[#135D66] transition-colors">
              <FaSearch />
            </button>
          </div>

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
                      {/* notranslate added to recent post title */}
                      <h4 className="notranslate font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors leading-tight text-sm">
                        {post.title}
                      </h4>
                    </Link>
                    {index < recentPosts.length - 1 && (
                      <div className="w-full border-b border-dashed border-gray-300"></div>
                    )}
                  </div>
                )
              })}
              {recentPosts.length === 0 && <p className="text-sm text-gray-400 italic">No posts yet.</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-extrabold text-[#135D66] border-l-4 border-[#E59A1D] pl-3 mb-6 leading-none">
              Top Categories
            </h3>
            <div className="space-y-4">
              {topCategories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveFilter({ type: "category", value: cat.category })}
                  className="w-full flex justify-between items-center group py-1"
                >
                  {/* notranslate added to category */}
                  <span className="notranslate font-bold text-[#135D66] group-hover:text-[#E59A1D] transition-colors">{cat.category}</span>
                  <span className="text-gray-400 font-medium text-sm">( {cat.count.toString().padStart(2, '0')} )</span>
                </button>
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
                <button 
                  key={idx}
                  onClick={() => setActiveFilter({ type: "tag", value: t.tag })}
                  // notranslate added to tags
                  className="notranslate bg-[#E9F4F5] text-[#135D66] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#135D66] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {t.tag}
                </button>
              ))}
              {topTags.length === 0 && <p className="text-sm text-gray-400 italic">No tags found.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
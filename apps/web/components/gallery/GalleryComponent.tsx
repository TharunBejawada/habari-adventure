"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { apiFetch } from "../../lib/apiClient"; // Adjust path as needed

const FILTERS = ["All", "Climbing", "Safari", "Destinations", "Day Trips"];

// Helper to extract YouTube video ID for high-res thumbnails
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
};

export default function GalleryComponent() {
  const [items, setItems] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: LIGHTBOX STATE ---
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [currentVideoPage, setCurrentVideoPage] = useState(0);
  const videoScrollRef = useRef<HTMLDivElement>(null);

  // Calculate pages (assuming 3 per view on desktop, adjust if needed)
  const videos = items.filter((item) => item.type === "VIDEO");
  const totalVideoPages = Math.ceil(videos.length / 3);

  const handleVideoScroll = () => {
    if (videoScrollRef.current) {
      const scrollLeft = videoScrollRef.current.scrollLeft;
      const clientWidth = videoScrollRef.current.clientWidth;
      setCurrentVideoPage(Math.round(scrollLeft / clientWidth));
    }
  };

  const scrollToVideoPage = (pageIndex: number) => {
    if (videoScrollRef.current) {
      videoScrollRef.current.scrollTo({
        left: pageIndex * videoScrollRef.current.clientWidth,
        behavior: "smooth"
      });
      setCurrentVideoPage(pageIndex);
    }
  };

  useEffect(() => {
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
    fetchGallery();
  }, []);

  // Split and filter data
  const images = items.filter(
    (item) => item.type === "IMAGE" && (activeFilter === "All" || item.category === activeFilter)
  );

  return (
    <section className="w-full py-12 md:py-20 bg-[#FDFEFE] overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-[96%] px-4 sm:px-6">
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="headingCSS text-3xl md:text-5xl font-extrabold text-[#135D66] tracking-tight mb-4">
            Best Memorable <span className="text-[#fe6e00]">Gallery!</span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <p className="descCSS text-sm md:text-base text-gray-500 font-medium">
              Destinations worth exploring! Here are a few popular spots
            </p>
          </div>
          <div className="-mt-10">
            <Image src="/Title-Separator.png" alt="Image" className="w-117.5" width="470" height="70" loading="lazy" />
          </div>
        </div>

        {/* --- 2. FILTERS --- */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                activeFilter === filter
                  ? "bg-[#135D66] text-white"
                  : "bg-white text-[#135D66]/70 border border-[#135D66]/10 hover:bg-[#135D66]/5 hover:shadow-md"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* --- 3. MASONRY IMAGE GRID --- */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            No images found for this category.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {images.map((img) => (
              <div 
                key={img.id} 
                onClick={() => setLightboxImage(img.url)}
                className="break-inside-avoid relative rounded-[24px] overflow-hidden group shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
              >
                {/* We use standard <img> here instead of Next Image to let the browser auto-calculate height for true masonry */}
                <img 
                  src={img.url} 
                  alt={img.title || "Gallery Image"} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                  {/* NEW: Expand Icon (Top Right) */}
                  <div className="p-4 flex justify-end">
                    <button
                      onClick={() => setLightboxImage(img.url)}
                      className="bg-white/90 hover:bg-white text-gray-900 p-2.5 shadow-lg transition-colors cursor-pointer transform -translate-y-2 group-hover:translate-y-0 duration-300"
                      title="View Fullscreen"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Title Info */}
                  <div className="p-5 w-full">
                    <p className="text-white font-bold text-lg drop-shadow-md truncate">
                      {img.title || img.category || "Beautiful Destination"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- 4. RIGHT ALIGNED TEXT --- */}
        <div className="mt-16 mb-20 text-right border-r-4 border-[#fe6e00] pr-6">
          <h3 className="headingCSS text-lg md:text-xl font-bold text-[#135D66] mb-1">
            Explore the Most Beautiful
          </h3>
          <h2 className="headingCSS text-4xl md:text-6xl font-black text-[#fe6e00] uppercase tracking-wide">
            Place In The World
          </h2>
        </div>

        {/* --- 5. YOUTUBE VIDEOS SECTION --- */}
        {videos.length > 0 && (
          <div className="mt-20 pt-16 border-t border-gray-100 relative group">
            <h2 className="headingCSS text-3xl md:text-4xl font-extrabold text-[#135D66] text-center mb-12">
              Featured <span className="text-[#fe6e00]">Video Tours</span>
            </h2>

            {/* Video Carousel Container */}
            <div 
              ref={videoScrollRef}
              onScroll={handleVideoScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar scroll-smooth justify-center"
            >
              {videos.map((vid) => {
                const videoId = getYouTubeId(vid.url);
                const isPlaying = playingVideo === vid.id;

                return (
                  <div 
                    key={vid.id} 
                    className="min-w-[100%] md:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(33.333%-1.5rem)] bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col snap-start transition-transform duration-300"
                  >
                    {/* Media Container */}
                    <div className="relative w-full aspect-video bg-gray-900">
                      {isPlaying ? (
                        <iframe
                          className="w-full h-full absolute inset-0"
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div 
                          className="w-full h-full relative cursor-pointer group/vid" 
                          onClick={() => setPlayingVideo(vid.id)}
                        >
                          <Image 
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                            alt="Video Thumbnail" 
                            fill 
                            unoptimized 
                            className="object-cover opacity-80 group-hover/vid:opacity-100 group-hover/vid:scale-105 transition-all duration-500" 
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-[#fe6e00]/90 rounded-full flex items-center justify-center pl-1 shadow-xl group-hover/vid:bg-[#fe6e00] group-hover/vid:scale-110 transition-all duration-300">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Content - Only View Button */}
                    <div className="p-5 flex justify-center items-center bg-white">
                      {!isPlaying ? (
                        <button 
                          onClick={() => setPlayingVideo(vid.id)}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-50 hover:bg-[#fe6e00] text-[#fe6e00] hover:text-white font-bold rounded-xl transition-colors border border-gray-200 hover:border-[#fe6e00] w-full"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View
                        </button>
                      ) : (
                        <button 
                          onClick={() => setPlayingVideo(null)}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold rounded-xl transition-colors border border-red-100 hover:border-red-500 w-full"
                        >
                          Close Video
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- PAGINATION DOTS --- */}
            {totalVideoPages > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-6">
                {Array.from({ length: totalVideoPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToVideoPage(idx)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      currentVideoPage === idx ? "w-8 bg-[#fe6e00]" : "w-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to video page ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Hide default scrollbar but retain swipe/scroll capabilities */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />

      {/* --- NEW: LIGHTBOX MODAL --- */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Dimmed background click closes modal */}
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setLightboxImage(null)}
          ></div>
          
          {/* Close Button */}
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/10 hover:bg-white text-white hover:text-black p-3 transition-colors z-10 shadow-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Fullscreen Image Container */}
          <div className="relative z-10 max-w-7xl w-full h-full flex items-center justify-center pointer-events-none">
            <img 
              src={lightboxImage} 
              alt="Fullscreen Gallery View" 
              className="max-w-full max-h-full object-contain pointer-events-auto shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      )}

    </section>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { apiFetch } from "../../../lib/apiClient";

// NEW: Import the Booking Modal
import BookingModal from "../../../components/modals/BookingModal";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function DeparturesPage() {
  const [dates, setDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalData, setBookingModalData] = useState<any>({});

  // NEW: Booking Modal Handler
  const openBooking = (pkgTitle: string, dateString: string) => {
    setBookingModalData({
      bookingType: "UpcomingDate",
      packageName: pkgTitle || "Standard Departure",
      departureDate: dateString,
    });
    setIsBookingModalOpen(true);
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    apiFetch("/upcoming-dates")
      .then(result => {
        if (result.ok && Array.isArray(result.data)) {
          const today = new Date(new Date().setHours(0, 0, 0, 0));
          const futureDates = result.data.filter((d: any) => {
            if (!d?.startDate) return false;
            const dt = new Date(d.startDate);
            return !isNaN(dt.getTime()) && dt >= today;
          });
          setDates(futureDates);
        }
      })
      .catch(err => console.error("Failed to fetch schedule", err))
      .finally(() => setIsLoading(false));
  }, []);

  // --- 2. GROUP DATA BY YEAR AND MONTH ---
  const groupedSchedule = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    
    // The API already returns these sorted by startDate ascending!
    dates.forEach(dateObj => {
      const d = new Date(dateObj.startDate);
      const year = d.getFullYear().toString();
      const month = d.toLocaleString('en-US', { month: 'long' }); 
      
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      
      groups[year][month].push(dateObj);
    });
    
    return groups;
  }, [dates]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-32 pb-40">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#fe6e00] rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFEFE] min-h-screen font-sans text-gray-800 pb-24">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden -mt-[150px] z-0 bg-[#135D66]">
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
            .animate-fade-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            .animate-fade-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            @keyframes moveCloudContact { 0% { transform: translateX(-20vw); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateX(110vw); opacity: 0; } }
            .animate-cloud-horizontal { animation: moveCloudContact 40s linear infinite; }
            @keyframes movePlaneDiag { 0% { transform: translate(-20vw, -5vh) rotate(15deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(110vw, 15vh) rotate(15deg); opacity: 0; } }
            .animate-plane-diagonal { animation: movePlaneDiag 25s linear infinite; }
            @keyframes floatUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
            @keyframes floatDown { 0%, 100% { transform: translateY(-30px); } 50% { transform: translateY(0); } }
            .animate-balloon-1 { animation: floatUp 6s ease-in-out infinite; }
            .animate-balloon-2 { animation: floatDown 7s ease-in-out infinite; }
          `
        }} />

        <div className="absolute inset-0 z-0">
          <Image src="/contact-mountains.png" alt="Mountains Background" fill sizes="100vw" className="object-cover object-bottom opacity-50 mix-blend-overlay" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FDFEFE] to-transparent z-0"></div>
        </div>

        <div className="absolute top-[25%] lg:top-[30%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-cloud-horizontal">
            <Image src="/Cloud3.png" alt="Cloud" width={320} height={183} sizes="(max-width: 768px) 180px, 320px" className="w-[180px] md:w-[320px] opacity-80" />
          </div>
        </div>

        <div className="absolute top-[10%] lg:top-[15%] w-full z-10 pointer-events-none">
          <div className="inline-block animate-plane-diagonal">
            <Image src="/plane.png" alt="Airplane" width={300} height={150} sizes="(max-width: 768px) 180px, 300px" className="w-[180px] md:w-[300px] drop-shadow-xl" />
          </div>
        </div>

        <div className="absolute top-[10%] right-0 lg:right-5 z-10 pointer-events-none hidden md:block">
          <div className="relative w-[200px] h-[350px]">
            <div className="absolute top-0 right-14 animate-balloon-1">
              <Image src="/balloon-blue.png" alt="Hot Air Balloon" width={130} height={176} sizes="(max-width: 1024px) 100px, 130px" className="w-[100px] lg:w-[130px] drop-shadow-xl" />
            </div>
            <div className="absolute top-32 right-[-10px] animate-balloon-2">
              <Image src="/balloon-red.png" alt="Hot Air Balloon" width={90} height={130} sizes="(max-width: 1024px) 70px, 90px" className="w-[70px] lg:w-[90px] drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto w-[96%] relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="headingCSS animate-fade-right text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-[0.85em]">Upcoming</span>{' '}<span className={`${caveat.className} text-[#fe6e00] font-normal text-[1.1em]`}>Departures</span>
          </h1>
          <p className="descCSS animate-fade-left font-medium text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl drop-shadow-md" style={{ animationDelay: '0.3s' }}>
            Join a scheduled group climb or safari. Fixed dates, guaranteed adventures, and amazing new friends.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. SCHEDULE LISTING SECTION                */}
      {/* ========================================== */}
      <section className="relative z-20 -mt-24 mb-16 px-4 md:px-8 max-w-5xl mx-auto border-gray-200 bg-white/70 rounded-3xl shadow-lg py-12">
        
        {dates.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <h3 className="text-2xl font-extrabold text-[#135D66] mb-3">No Upcoming Dates</h3>
            <p className="text-gray-500">We are currently updating our schedule. Please check back soon or contact us for a private booking!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedSchedule).map(([year, months]) => (
              <div key={year} className="space-y-8 animate-fade-in">
                
                {/* Year Header */}
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 border-b-4 border-[#fe6e00] inline-block pb-2">
                  {year}
                </h2>

                <div className="space-y-12">
                  {Object.entries(months).map(([month, monthDates]) => (
                    <div key={month} className="space-y-6">
                      
                      {/* Month Header */}
                      <h3 className="text-2xl font-extrabold text-[#135D66] flex items-center gap-4">
                        {month} 
                        <span className="flex-1 h-px bg-gray-200 block"></span>
                      </h3>

                      {/* Departures Grid/List */}
                      <div className="space-y-4">
                        {monthDates.map((d: any) => {
                          const isSoldOut = d.status === "Sold Out";
                          const isGuaranteed = d.status === "Guaranteed";
                          const startDate = new Date(d.startDate);
                          const endDate = new Date(d.endDate);
                          const isLowAvailability = !isSoldOut && d.availableSeats <= 3;

                          return (
                            <div key={d.id} className={`bg-white rounded-2xl border ${isSoldOut ? 'border-gray-200 opacity-75' : 'border-[#135D66]/20 shadow-lg hover:shadow-xl hover:-translate-y-1'} transition-all duration-300 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center`}>
                              
                              {/* Left: Start Date Box */}
                              <div className="flex flex-row md:flex-col items-center justify-center w-full md:w-28 bg-[#F0F9FA] rounded-xl p-3 shrink-0 text-center border border-[#135D66]/10 gap-2 md:gap-0">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{startDate.toLocaleString('en-US', { month: 'short' })}</span>
                                <span className="text-3xl md:text-4xl font-black text-[#135D66] leading-none">{startDate.getDate()}</span>
                              </div>

                              {/* Middle: Trip Details */}
                              <div className="flex-1 space-y-3">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                                    isSoldOut ? 'bg-red-50 text-red-600 border border-red-200' :
                                    isGuaranteed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-green-50 text-green-700 border border-green-200'
                                  }`}>
                                    {d.status}
                                  </span>
                                </div>

                                {/* Titles & NEW Icons */}
                                <div>
                                  <div className="flex items-center flex-wrap gap-2">
                                    <h4 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
                                      {d.package?.title}
                                    </h4>
                                    
                                    {/* Event Icons Container */}
                                    <div className="flex items-center gap-1.5 text-xl relative top-[1px]">
                                      {d.isFullMoon && (
                                        <div className="group relative cursor-help flex items-center justify-center">
                                          <span>🌗</span>
                                          {/* Custom Tooltip */}
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                            Full Moon Summit
                                          </div>
                                        </div>
                                      )}
                                      
                                      {d.isChristmas && (
                                        <div className="group relative cursor-help flex items-center justify-center">
                                          <span>🎄</span>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                            Christmas Summit
                                          </div>
                                        </div>
                                      )}
                                      
                                      {d.isNewYear && (
                                        <div className="group relative cursor-help flex items-center justify-center">
                                          <span>⭐</span>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                            New Year Summit
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {d.title && <p className="text-sm font-bold text-[#fe6e00] mt-1">{d.title}</p>}
                                </div>

                                {/* Date Range & Explore Link */}
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-[#135D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} — {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </span>
                                  <span className="text-gray-300 hidden md:inline">|</span>
                                  <Link href={`/${d.package?.slug}`} className="text-[#135D66] font-bold hover:underline hover:text-[#fe6e00] transition-colors flex items-center gap-1 group">
                                    Explore Trip Details
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                  </Link>
                                </div>
                              </div>

                              {/* Right: Pricing & CTA */}
                              <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-4 md:gap-2">
                                <div className="text-left md:text-right">
                                  <p className="text-sm font-bold text-gray-400">From</p>
                                  <p className="text-3xl font-black text-gray-900">${d.price}</p>
                                  <p className={`text-xs font-bold mt-1 ${isSoldOut ? 'text-red-500' : isLowAvailability ? 'text-orange-500' : 'text-gray-500'}`}>
                                    {isSoldOut ? '0 Seats Left' : `${d.availableSeats} of ${d.totalSeats} Seats Left`}
                                  </p>
                                </div>
                                
                                {isSoldOut ? (
                                  <button disabled className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed uppercase tracking-normal text-sm">
                                    Sold Out
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => openBooking(d.package?.title, startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))}
                                    className="w-full md:w-auto px-8 py-3 bg-[#fe6e00] hover:bg-[#fe6e00] text-white shadow-lg shadow-[#fe6e00]/20 font-black rounded-xl transition-transform hover:-translate-y-1 text-center"
                                  >
                                    Book Now
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================== */}
      {/* BOOKING MODAL                              */}
      {/* ========================================== */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        initialData={bookingModalData} 
      />

    </div>
  );
}
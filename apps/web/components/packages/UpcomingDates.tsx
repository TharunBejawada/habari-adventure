// apps/web/components/packages/UpcomingDates.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/apiClient";
import { normalizeSlugPath } from "../../lib/slugify";

// NEW: Define the TypeScript Interface for your props
interface UpcomingDatesProps {
  onBook?: (date: string) => void;
}

// NEW: Apply the Interface to your component signature
export default function UpcomingDates({ onBook }: UpcomingDatesProps) {
  const params = useParams();
  
  // Extract lang for links
  const lang = (params.lang as string) || "en";

  // Decode and normalize each param segment to produce a clean, canonical slug
  const categoryParam = normalizeSlugPath(params.category ? decodeURIComponent(params.category as string) : "");
  const locationParam = normalizeSlugPath(params.location ? decodeURIComponent(params.location as string) : "");

  // Handle catch-all arrays or single strings for the package slug
  const packageParamRaw = params.packageSlug;
  const packageParam = normalizeSlugPath(
    Array.isArray(packageParamRaw)
      ? packageParamRaw.map(p => decodeURIComponent(p)).join("/")
      : (packageParamRaw ? decodeURIComponent(packageParamRaw as string) : "")
  );

  // Reconstruct the full canonical slug and strip any accidental leading slashes
  const fullDbSlug = `${categoryParam}/${locationParam}/${packageParam}`.replace(/^\/+/, "");

  const [dates, setDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fullDbSlug || fullDbSlug === "//") return;

    apiFetch("/upcoming-dates")
      .then(result => {
        if (result.ok && Array.isArray(result.data)) {
          const today = new Date(new Date().setHours(0, 0, 0, 0));
          const packageDates = result.data.filter((d: any) => {
            if (!d?.startDate) return false;
            const dt = new Date(d.startDate);
            // Compare normalized slugs so old DB records with spaces still match
            const dbSlug = normalizeSlugPath(d.package?.slug || "");
            return (dbSlug === fullDbSlug || d.package?.slug === fullDbSlug) && !isNaN(dt.getTime()) && dt >= today;
          });
          setDates(packageDates);
        }
      })
      .catch(err => console.error("Failed to fetch dates", err))
      .finally(() => setIsLoading(false));
  }, [fullDbSlug]);

  if (!isLoading && dates.length === 0) {
    // return (
    //   <section id="pricing-section" className="py-16 lg:py-24 bg-white border-b border-gray-100">
    //     <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
    //       <h2 className="headingCSS text-3xl font-extrabold text-gray-900 mb-4">
    //         Upcoming <span className="text-[#fe6e00]">Dates</span>
    //       </h2>
    //       <p className="descCSS text-gray-600 text-lg mb-6">
    //         We are currently organizing our next group departures for this route.
    //       </p>
    //       <Link href={`/${lang}/contact`} className="bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md">
    //         Request Private Dates
    //       </Link>
    //     </div>
    //   </section>
    // );
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-[#f9fafb] border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        <div className="mb-10">
          <h2 className="headingCSS text-4xl font-extrabold text-gray-900 mb-2">
            Upcoming <span className="text-[#fe6e00]">Dates</span>
          </h2>
          <p className="descCSS text-gray-600 text-lg">
            Join a group or go private. Early season and group discounts available.
          </p>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-[#fe6e00] font-bold animate-pulse">
            Loading schedule...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 font-bold text-[#fe6e00] w-1/5 pl-4">Start Date</th>
                  <th className="pb-4 font-bold text-[#fe6e00] w-1/4">Departure Details</th>
                  {/* <th className="pb-4 font-bold text-[#fe6e00] w-1/5">Availability</th> */}
                  <th className="pb-4 font-bold text-[#fe6e00] w-1/6">Price (USD)</th>
                  <th className="pb-4 w-1/5 text-right pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dates.map((row) => {
                  const isSoldOut = row.status === "Sold Out" || row.availableSeats === 0;
                  const isGuaranteed = row.status === "Guaranteed";
                  const startDate = new Date(row.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-5 font-bold text-gray-900 pl-4">{startDate}</td>
                      
                      <td className="py-5">
                        <div className="flex flex-col gap-1.5">
                          
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-bold text-gray-800">{row.title || "Standard Departure"}</span>
                            
                            {/* Event Icons Container */}
                            <div className="flex items-center gap-1.5 text-lg relative top-[1px]">
                              {row.isFullMoon && (
                                <div className="group/icon relative cursor-help flex items-center justify-center">
                                  <span>🌗</span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/icon:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                    Full Moon Summit
                                  </div>
                                </div>
                              )}
                              
                              {row.isChristmas && (
                                <div className="group/icon relative cursor-help flex items-center justify-center">
                                  <span>🎄</span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/icon:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                    Christmas Summit
                                  </div>
                                </div>
                              )}
                              
                              {row.isNewYear && (
                                <div className="group/icon relative cursor-help flex items-center justify-center">
                                  <span>⭐</span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/icon:block bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded whitespace-nowrap shadow-lg z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                    New Year Summit
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </td>

                      {/* <td className="py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold ${isSoldOut ? 'text-red-500' : 'text-gray-700'}`}>
                            {isSoldOut ? '0 Spots Left' : `${row.availableSeats} Spots Left`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                            isSoldOut ? 'bg-red-50 text-red-600 border border-red-200' :
                            isGuaranteed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </td> */}

                      <td className="py-5 font-bold text-gray-900">${row.price}</td>
                      
                      <td className="py-5 text-right pr-4">
                        {isSoldOut ? (
                          <button disabled className="bg-gray-200 text-gray-500 font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider cursor-not-allowed">
                            SOLD OUT
                          </button>
                        ) : (
                          <button 
                            onClick={() => onBook && onBook(startDate)}
                            className="cursor-pointer inline-block bg-[#fe6e00] hover:bg-[#fe6e00] text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition-transform shadow-md hover:-translate-y-0.5"
                          >
                            BOOK NOW
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#fe6e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-gray-700 font-medium">
            Want your own private dates? <Link href={`/${lang}/contact`} className="text-[#135D66] hover:text-[#fe6e00] hover:underline font-bold transition-colors">Contact us for a custom departure.</Link>
          </p>
        </div>

      </div>
    </section>
  );
}
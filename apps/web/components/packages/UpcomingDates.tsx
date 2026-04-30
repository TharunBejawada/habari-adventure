// // apps/web/components/packages/UpcomingDates.tsx
// "use client";

// export default function UpcomingDates() {
//   // Static mock data for now
//   const dates = [
//     { id: 1, date: "12 Jan 2026", variant: "8-Day Lemosho", spots: "6 Spots", price: "$2,450", status: "RESERVE" },
//     { id: 2, date: "9 Feb 2026", variant: "7-Day Lemosho", spots: "Waitlist", price: "$2,150", status: "JOIN WAITLIST" },
//     { id: 3, date: "15 Jun 2026", variant: "8-Day Lemosho", spots: "9 Spots", price: "$2,490", status: "RESERVE" },
//   ];

//   return (
//     <section className="py-16 lg:py-24 bg-white border-b border-gray-100 reveal-on-scroll">
//       <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
//         <div className="mb-10">
//           <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
//             Upcoming <span className="text-[#98D80D]">Dates</span>
//           </h2>
//           <p className="text-gray-600 text-lg">
//             Join a group or go private. Early season and group discounts available.
//           </p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse min-w-[700px]">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="pb-4 font-bold text-[#98D80D] w-1/5">Start Date</th>
//                 <th className="pb-4 font-bold text-[#98D80D] w-1/5">Route Variant</th>
//                 <th className="pb-4 font-bold text-[#98D80D] w-1/5">Availability</th>
//                 <th className="pb-4 font-bold text-[#98D80D] w-1/5">Price (USD)</th>
//                 <th className="pb-4 w-1/5"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {dates.map((row) => (
//                 <tr key={row.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="py-5 font-semibold text-gray-900">{row.date}</td>
//                   <td className="py-5 text-gray-700">{row.variant}</td>
//                   <td className="py-5 text-gray-700">{row.spots}</td>
//                   <td className="py-5 text-gray-700">{row.price}</td>
//                   <td className="py-5 text-right">
//                     {row.status === "RESERVE" ? (
//                       <button className="bg-[#98D80D] hover:bg-[#d41538] text-white font-bold py-2 px-6 rounded-full text-xs uppercase tracking-wider transition-all shadow-sm hover:-translate-y-0.5">
//                         {row.status}
//                       </button>
//                     ) : (
//                       <button className="bg-white border-2 border-gray-200 text-gray-600 hover:border-[#98D80D] hover:text-[#98D80D] font-bold py-1.5 px-6 rounded-full text-xs uppercase tracking-wider transition-all">
//                         {row.status}
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="mt-8">
//           <p className="text-gray-700 font-medium">
//             Want your own dates? <a href="/contact" className="text-[#98D80D] hover:underline font-bold">Contact us</a>
//           </p>
//         </div>

//       </div>
//     </section>
//   );
// }

// apps/web/components/packages/UpcomingDates.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UpcomingDates() {
  const params = useParams();
  const slug = params.slug as string;

  const [dates, setDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upcoming-dates`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          // Filter out past dates AND ensure they belong to THIS package
          const packageDates = data.data.filter((d: any) => 
            d.package?.slug === slug && 
            new Date(d.startDate) >= new Date(new Date().setHours(0,0,0,0))
          );
          setDates(packageDates);
        }
      })
      .catch(err => console.error("Failed to fetch dates", err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // If there are no dates scheduled, we can either hide the section entirely by returning null, 
  // or show a friendly message. A friendly message is usually better for conversions!
  if (!isLoading && dates.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Upcoming <span className="text-[#98D80D]">Dates</span>
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            We are currently organizing our next group departures for this route.
          </p>
          <Link href="/contact" className="bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-bold py-3 px-8 rounded-full transition-all">
            Request Private Dates
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Upcoming <span className="text-[#98D80D]">Dates</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Join a group or go private. Early season and group discounts available.
          </p>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-[#98D80D] font-bold animate-pulse">
            Loading schedule...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 font-bold text-[#98D80D] w-1/5 pl-4">Start Date</th>
                  <th className="pb-4 font-bold text-[#98D80D] w-1/4">Departure Details</th>
                  <th className="pb-4 font-bold text-[#98D80D] w-1/5">Availability</th>
                  <th className="pb-4 font-bold text-[#98D80D] w-1/6">Price (USD)</th>
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
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-800">{row.title || "Standard Departure"}</span>
                          {row.isFullMoon && (
                            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full w-fit">
                              🌕 FULL MOON
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold ${isSoldOut ? 'text-red-500' : 'text-gray-700'}`}>
                            {isSoldOut ? '0 Spots Left' : `${row.availableSeats} Spots Left`}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                            isSoldOut ? 'bg-red-50 text-red-600' :
                            isGuaranteed ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 font-bold text-gray-900">${row.price}</td>
                      
                      <td className="py-5 text-right pr-4">
                        {isSoldOut ? (
                          <button disabled className="bg-gray-200 text-gray-500 font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider cursor-not-allowed">
                            SOLD OUT
                          </button>
                        ) : (
                          <Link 
                            href={`/book?date=${row.id}&package=${slug}`} 
                            className="inline-block bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider transition-transform shadow-md hover:-translate-y-0.5"
                          >
                            BOOK NOW
                          </Link>
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
          <svg className="w-5 h-5 text-[#98D80D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-gray-700 font-medium">
            Want your own private dates? <Link href="/contact" className="text-[#135D66] hover:text-[#98D80D] hover:underline font-bold transition-colors">Contact us for a custom departure.</Link>
          </p>
        </div>

      </div>
    </section>
  );
}
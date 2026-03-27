// apps/web/components/packages/UpcomingDates.tsx
"use client";

export default function UpcomingDates() {
  // Static mock data for now
  const dates = [
    { id: 1, date: "12 Jan 2026", variant: "8-Day Lemosho", spots: "6 Spots", price: "$2,450", status: "RESERVE" },
    { id: 2, date: "9 Feb 2026", variant: "7-Day Lemosho", spots: "Waitlist", price: "$2,150", status: "JOIN WAITLIST" },
    { id: 3, date: "15 Jun 2026", variant: "8-Day Lemosho", spots: "9 Spots", price: "$2,490", status: "RESERVE" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-gray-100 reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Upcoming <span className="text-[#F51A43]">Dates</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Join a group or go private. Early season and group discounts available.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 font-bold text-[#F51A43] w-1/5">Start Date</th>
                <th className="pb-4 font-bold text-[#F51A43] w-1/5">Route Variant</th>
                <th className="pb-4 font-bold text-[#F51A43] w-1/5">Availability</th>
                <th className="pb-4 font-bold text-[#F51A43] w-1/5">Price (USD)</th>
                <th className="pb-4 w-1/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dates.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5 font-semibold text-gray-900">{row.date}</td>
                  <td className="py-5 text-gray-700">{row.variant}</td>
                  <td className="py-5 text-gray-700">{row.spots}</td>
                  <td className="py-5 text-gray-700">{row.price}</td>
                  <td className="py-5 text-right">
                    {row.status === "RESERVE" ? (
                      <button className="bg-[#F51A43] hover:bg-[#d41538] text-white font-bold py-2 px-6 rounded-full text-xs uppercase tracking-wider transition-all shadow-sm hover:-translate-y-0.5">
                        {row.status}
                      </button>
                    ) : (
                      <button className="bg-white border-2 border-gray-200 text-gray-600 hover:border-[#F51A43] hover:text-[#F51A43] font-bold py-1.5 px-6 rounded-full text-xs uppercase tracking-wider transition-all">
                        {row.status}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <p className="text-gray-700 font-medium">
            Want your own dates? <a href="/contact" className="text-[#F51A43] hover:underline font-bold">Contact us</a>
          </p>
        </div>

      </div>
    </section>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  monthYear: string;
  length: string;
  groupSize: string;
  include: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setBookings(data.data);
        setFilteredBookings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Real-time Search Filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBookings(bookings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = bookings.filter((b) =>
        b.firstName.toLowerCase().includes(query) ||
        (b.lastName && b.lastName.toLowerCase().includes(query)) ||
        b.email.toLowerCase().includes(query) ||
        b.include.toLowerCase().includes(query)
      );
      setFilteredBookings(filtered);
    }
  }, [searchQuery, bookings]);

  // Helper to format the Date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Helper for Status Badge Colors
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'closed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper to format the "Include" type nicely
  const formatInclude = (include: string) => {
    const map: Record<string, string> = {
      'kilimanjaro': 'Kilimanjaro',
      'safari': 'Safari',
      'zanzibar': 'Zanzibar',
      'kili-safari': 'Kili + Safari',
      'safari-zanzibar': 'Safari + Zanzibar',
      'all': 'Full Combo'
    };
    return map[include] || include;
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen">
      
      {/* Custom Keyframe Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-row {
            animation: slideUpFade 0.4s ease-out forwards;
            opacity: 0;
          }
        `
      }} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group"
          >
            <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Trip Inquiries</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and respond to customer quote requests.</p>
        </div>
        <div className="bg-[#E9F4F5] px-5 py-3 rounded-xl border border-[#135D66]/10">
          <p className="text-sm font-bold text-[#135D66]">Total Inquiries</p>
          <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by name, email, or trip type..." 
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:bg-white focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66] transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-gray-200 border-t-[#135D66] rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-bold">Loading Inquiries...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Inquiries Found</h3>
            <p className="text-gray-500 font-medium">When customers submit a quote request, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Trip Details</th>
                  <th className="p-4 w-1/3">Message Preview</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking, index) => {
                  const { date, time } = formatDate(booking.createdAt);
                  return (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-[#F0F9FA]/50 transition-colors group animate-row"
                      style={{ animationDelay: `${index * 0.05}s` }} // Staggered animation
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#135D66] text-white flex items-center justify-center font-bold text-lg shrink-0">
                            {booking.firstName.charAt(0)}{booking.lastName ? booking.lastName.charAt(0) : ''}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900">{booking.firstName} {booking.lastName}</p>
                            <a href={`mailto:${booking.email}`} className="text-xs font-medium text-gray-500 hover:text-[#135D66] transition-colors block mt-0.5">{booking.email}</a>
                            {booking.phone && (
                              <a href={`tel:${booking.phone}`} className="text-xs font-medium text-gray-500 hover:text-[#135D66] transition-colors block">{booking.phone}</a>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold bg-gray-100 text-gray-700 border border-gray-200 w-fit uppercase tracking-wider">
                            {formatInclude(booking.include)}
                          </span>
                          <p className="text-sm font-bold text-gray-800">
                            {booking.monthYear} <span className="text-gray-400 font-normal">({booking.length} Days)</span>
                          </p>
                          <p className="text-xs font-medium text-gray-500">Group: {booking.groupSize} People</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:bg-white transition-colors h-full">
                          <p className="text-sm text-gray-600 line-clamp-3 font-medium leading-relaxed italic">
                            "{booking.message}"
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900">{date}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{time}</p>
                      </td>

                      <td className="p-4 text-right pr-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                        
                        {/* Optional Action Button Placeholder */}
                        <div className="mt-2 flex justify-end">
                          <button className="text-xs font-bold text-[#E59A1D] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
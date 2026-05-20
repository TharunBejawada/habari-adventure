// apps/web/app/admin/bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
// Use your existing API client setup!
import { apiFetch, getAdminToken } from "../../../lib/apiClient"; 

interface Booking {
  id: string;
  bookingType: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  packageName?: string;
  departureDate?: string;
  monthYear?: string;
  length?: string;
  groupSize?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Uses your exact existing apiFetch logic
      const { ok, data } = await apiFetch("/bookings", {
        token: getAdminToken() 
      });
      
      if (ok && Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { ok } = await apiFetch(`/bookings/${id}`, {
        method: "PUT",
        token: getAdminToken(),
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        if (selectedBooking?.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Contacted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "UpcomingDate": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Package": return "bg-green-50 text-green-700 border-green-200";
      case "Contact": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center font-bold text-gray-500">Loading Inquiries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-[#135D66]">Booking Inquiries</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all quotes, package requests, and departure bookings.</p>
        </div>
        <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          Total: {bookings.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-bold text-gray-600">Date Received</th>
                <th className="p-4 font-bold text-gray-600">Client</th>
                <th className="p-4 font-bold text-gray-600">Inquiry Type</th>
                <th className="p-4 font-bold text-gray-600">Trip Context</th>
                <th className="p-4 font-bold text-gray-600">Status</th>
                <th className="p-4 font-bold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500">{formatDate(booking.createdAt)}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{booking.firstName} {booking.lastName}</div>
                      <div className="text-gray-500 text-xs">{booking.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getTypeColor(booking.bookingType)}`}>
                        {booking.bookingType}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-gray-700">
                      {booking.packageName || booking.location || "General Inquiry"}
                    </td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${getStatusColor(booking.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-[#135D66] hover:text-[#fe6e00] font-bold text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* DETAILED BOOKING MODAL                     */}
      {/* ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBooking(null)}></div>
          
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Inquiry Details</h3>
                <p className="text-xs text-gray-500 mt-1">Received on {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">✕</button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getTypeColor(selectedBooking.bookingType)}`}>
                  Type: {selectedBooking.bookingType}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(selectedBooking.status)}`}>
                  Status: {selectedBooking.status}
                </span>
              </div>

              {/* Client Info Grid */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Client Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Name</span>
                    <span className="font-bold text-gray-900">{selectedBooking.firstName} {selectedBooking.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Email</span>
                    <a href={`mailto:${selectedBooking.email}`} className="font-bold text-[#135D66] hover:underline">{selectedBooking.email}</a>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Phone / WhatsApp</span>
                    {selectedBooking.phone ? (
                      <a href={`tel:${selectedBooking.phone}`} className="font-bold text-[#135D66] hover:underline">{selectedBooking.phone}</a>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Context Grid */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Trip Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-[#F0F9FA] p-4 rounded-xl border border-[#135D66]/10">
                  {selectedBooking.packageName && (
                    <div className="col-span-2">
                      <span className="block text-xs text-gray-500 mb-1">Package Name</span>
                      <span className="font-bold text-[#135D66]">{selectedBooking.packageName}</span>
                    </div>
                  )}
                  {selectedBooking.location && (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Location</span>
                      <span className="font-bold text-gray-900">{selectedBooking.location}</span>
                    </div>
                  )}
                  {selectedBooking.departureDate ? (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Fixed Departure Date</span>
                      <span className="font-bold text-[#fe6e00]">{selectedBooking.departureDate}</span>
                    </div>
                  ) : selectedBooking.monthYear && (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Flexible Travel Month</span>
                      <span className="font-bold text-gray-900">{selectedBooking.monthYear}</span>
                    </div>
                  )}
                  {selectedBooking.length && (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Duration</span>
                      <span className="font-bold text-gray-900">{selectedBooking.length} Days</span>
                    </div>
                  )}
                  {selectedBooking.groupSize && (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Group Size</span>
                      <span className="font-bold text-gray-900">{selectedBooking.groupSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Box */}
              {selectedBooking.message && (
                <div>
                  <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Client Message</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm shadow-inner">
                    {selectedBooking.message}
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <a 
                href={`mailto:${selectedBooking.email}`} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors"
              >
                Reply via Email
              </a>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="px-6 py-2.5 bg-[#111827] hover:bg-black text-white font-bold rounded-full transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
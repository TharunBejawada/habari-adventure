// apps/web/components/modals/BookingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/apiClient"; 

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    bookingType: string;
    location?: string;
    packageName?: string;
    groupSize?: string; // Restored
    departureDate?: string;
    accommodation?: string; // NEW
  };
}

export default function BookingModal({ isOpen, onClose, initialData }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // monthYear: "",
    // length: "",
    message: "",
  });

  // NEW: Reset the form completely every time the modal is opened!
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        // monthYear: "",
        // length: "",
        message: "",
      });
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalGroupSize = initialData.groupSize;
      if (initialData.accommodation) {
        finalGroupSize = initialData.groupSize 
          ? `${initialData.groupSize} (${initialData.accommodation})` 
          : `Any Size (${initialData.accommodation})`;
      }

      // Merge user inputs with the pre-filled data passed from the parent component
      const payload = { ...formData, ...initialData, groupSize: finalGroupSize };

      const { ok } = await apiFetch("/bookings", { 
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        alert("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      alert("Submission failed.");
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {initialData.departureDate ? "Book Departure" : "Request a Quote"}
            </h3>
            {initialData.packageName && <p className="text-sm font-bold text-[#fe6e00] mt-1">{initialData.packageName}</p>}
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
              <p className="text-gray-600">Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Pre-filled Read-Only Context (Optional Visual Confirmation) */}
              <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {initialData.location && <span className="text-2xl font-bold bg-white px-3 py-1.5 rounded-md text-gray-600 border border-gray-200">📍 {initialData.location}</span>}
                
                {/* NEW: Display Accommodation Type visually */}
                {initialData.accommodation && <span className="text-2xl font-bold bg-white px-3 py-1.5 rounded-md text-gray-600 border border-gray-200">⛺ {initialData.accommodation}</span>}
                {/* Restored Group Size Badge */}
                {initialData.groupSize && <span className="text-2xl font-bold bg-white px-3 py-1.5 rounded-md text-gray-600 border border-gray-200">👥 {initialData.groupSize}</span>}
                
                {initialData.departureDate && <span className="text-2xl font-bold bg-white px-3 py-1.5 rounded-md text-[#135D66] border border-[#135D66]/20">📅 {initialData.departureDate}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                  <input required type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input required type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    onKeyDown={(e) => {
                      if (!/^[0-9+\-() ]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Flexible dates remain commented out */}
              {/* {!initialData.departureDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Month & Year</label>
                    <input 
                      type="month" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" 
                      value={formData.monthYear} 
                      onChange={e => setFormData({...formData, monthYear: e.target.value})} 
                      onKeyDown={(e) => {
                        if (!/^[0-9\-]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Trip Days</label>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="e.g. 8" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors" 
                      value={formData.length} 
                      onChange={e => setFormData({...formData, length: e.target.value})} 
                      onKeyDown={(e) => {
                        if (!/^[0-9]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              */}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66] bg-gray-50 focus:bg-white transition-colors resize-none" placeholder="Any special requests or details?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#fe6e00] hover:bg-[#c98616] text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all">
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UpcomingDatesAdminPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [dates, setDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW: Track if we are editing an existing record
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    packageId: "",
    title: "",
    startDate: "",
    endDate: "",
    price: "",
    totalSeats: 12,
    availableSeats: 12, 
    status: "Scheduled",
    isFullMoon: false
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      packageId: "", title: "", startDate: "", endDate: "", 
      price: "", totalSeats: 12, availableSeats: 12, 
      status: "Scheduled", isFullMoon: false
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, datesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upcoming-dates`)
        ]);
        const pkgData = await pkgRes.json();
        const datesData = await datesRes.json();
        
        if (pkgData.status === "success") setPackages(pkgData.data);
        if (datesData.status === "success") setDates(datesData.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date!");
      return;
    }
    if (formData.availableSeats > formData.totalSeats) {
      alert("Available seats cannot exceed total seats!");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upcoming-dates/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upcoming-dates`;
        
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.status === "success") {
        if (editingId) {
          // Update existing item in the array
          setDates(dates.map(d => d.id === editingId ? data.data : d).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
          alert("Departure updated successfully!");
        } else {
          // Add new item
          setDates([...dates, { ...data.data, package: packages.find(p => p.id === formData.packageId) }].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
          alert("Departure added successfully!");
        }
        resetForm();
      } else {
        alert(data.message || "Failed to save.");
      }
    } catch (err) {
      alert("Error saving date.");
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Handle Edit Button Click
  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setFormData({
      packageId: d.packageId,
      title: d.title || "",
      startDate: new Date(d.startDate).toISOString().split('T')[0],
      endDate: new Date(d.endDate).toISOString().split('T')[0],
      price: d.price.toString(),
      totalSeats: d.totalSeats,
      availableSeats: d.availableSeats,
      status: d.status,
      isFullMoon: d.isFullMoon
    });
    // Scroll to top where form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this departure date?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upcoming-dates/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      setDates(dates.filter(d => d.id !== id));
      if (editingId === id) resetForm(); // Clear form if deleting the item currently being edited
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3 inline-block">← Back to Dashboard</Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Manage Departures</h1>
          <p className="text-gray-500 font-medium">Schedule fixed upcoming dates for your packages.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Add/Edit Date Form */}
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5 sticky top-8">
            <div className="flex justify-between items-center border-b pb-3">
               <h3 className="font-extrabold text-lg text-[#135D66]">
                 {editingId ? "Edit Departure" : "Schedule New Date"}
               </h3>
               {editingId && (
                 <button type="button" onClick={resetForm} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel Edit</button>
               )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Package *</label>
              <select required className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.packageId} onChange={e => setFormData({...formData, packageId: e.target.value})}>
                <option value="" disabled>-- Choose a Package --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Departure Title (Optional)</label>
              <input type="text" placeholder="e.g., Christmas Special" className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                <input type="date" required className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                <input type="date" required min={formData.startDate || today} className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price ($)</label>
              <input type="number" required min="0" placeholder="e.g., 2500" className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Seats</label>
                <input type="number" required min="1" className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Available Seats</label>
                <input type="number" required min="0" max={formData.totalSeats} className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.availableSeats} onChange={e => setFormData({...formData, availableSeats: parseInt(e.target.value)})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:border-[#135D66]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Scheduled">Scheduled (Accepting Bookings)</option>
                <option value="Guaranteed">Guaranteed Departure</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#135D66]" checked={formData.isFullMoon} onChange={e => setFormData({...formData, isFullMoon: e.target.checked})} />
              <span className="font-bold text-gray-700">🌕 Full Moon Summit</span>
            </label>

            <button type="submit" disabled={isSaving || !formData.packageId} className="w-full py-3 bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-extrabold rounded-xl transition-all disabled:opacity-50">
              {isSaving ? "Saving..." : (editingId ? "Update Departure" : "Add Departure Date")}
            </button>
          </form>
        </div>

        {/* RIGHT: List of Scheduled Dates */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-extrabold text-lg text-gray-900">Upcoming Schedule</h3>
            </div>

            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-bold">Loading schedule...</div>
            ) : dates.length === 0 ? (
              <div className="p-16 text-center text-gray-500">No upcoming dates scheduled yet.</div>
            ) : (
              dates.map((d) => (
                <div key={d.id} className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${editingId === d.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-[#135D66] bg-[#135D66]/10 px-2 py-0.5 rounded uppercase">{d.package?.title}</span>
                      {d.isFullMoon && <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 rounded-full border border-yellow-200">FULL MOON</span>}
                    </div>
                    <p className="font-bold text-gray-900">
                      {new Date(d.startDate).toLocaleDateString()} — {new Date(d.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {d.title && <span className="font-medium mr-2 text-gray-800">"{d.title}"</span>}
                      <span className="text-[#E59A1D] font-bold">${d.price}</span> • {d.availableSeats}/{d.totalSeats} seats available
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      d.status === 'Guaranteed' ? 'bg-green-100 text-green-700' :
                      d.status === 'Sold Out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {d.status}
                    </span>
                    <button onClick={() => handleEdit(d)} className="text-[#E59A1D] hover:text-orange-600 text-xs font-bold bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
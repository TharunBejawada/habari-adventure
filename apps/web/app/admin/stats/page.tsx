"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch, getAdminToken } from "../../../lib/apiClient";

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  order: number;
  page: string; // NEW
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State - Added 'page' with default 'Home'
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ label: "", value: 0, suffix: "+", order: 0, page: "Home" });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    const { ok, data } = await apiFetch("/stats");
    if (ok) setStats(data);
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing ? `/stats/${isEditing}` : "/stats";

    const { ok } = await apiFetch(endpoint, {
      method,
      token: getAdminToken(),
      body: JSON.stringify(formData),
    });

    if (ok) {
      setFormData({ label: "", value: 0, suffix: "+", order: 0, page: "Home" });
      setIsEditing(null);
      fetchStats();
    } else {
      alert("Failed to save stat.");
    }
  };

  const handleEdit = (stat: Stat) => {
    setIsEditing(stat.id);
    // Ensure we capture the page (falling back to "Home" for legacy data)
    setFormData({ label: stat.label, value: stat.value, suffix: stat.suffix || "", order: stat.order, page: stat.page || "Home" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stat?")) return;
    const { ok } = await apiFetch(`/stats/${id}`, {
      method: "DELETE",
      token: getAdminToken(),
    });
    if (ok) fetchStats();
  };

  if (isLoading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Back to Dashboard Link */}
      <Link 
        href="/admin" 
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group"
      >
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Order</th>
              <th className="p-4 font-bold text-gray-600">Page</th> {/* NEW */}
              <th className="p-4 font-bold text-gray-600">Label</th>
              <th className="p-4 font-bold text-gray-600">Value</th>
              <th className="p-4 font-bold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.map(stat => (
              <tr key={stat.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-400">{stat.order}</td>
                <td className="p-4 font-bold">
                  <span className={`px-2.5 py-1 text-xs rounded-md ${stat.page === 'About' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {stat.page || "Home"}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900">{stat.label}</td>
                <td className="p-4 font-bold text-[#135D66]">{stat.value}{stat.suffix}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => handleEdit(stat)} className="text-[#fe6e00] font-bold">Edit</button>
                  <button onClick={() => handleDelete(stat.id)} className="text-red-500 font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-extrabold text-[#135D66] mb-6">
          {isEditing ? "Edit Stat" : "Add New Stat"}
        </h2>
        
        {/* Changed grid layout to 6 columns to fit the new select dropdown */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Label (e.g., Happy Travelers)</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#135D66]" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Value (Number)</label>
            <input required type="number" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#135D66]" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Suffix (+, %)</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#135D66]" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Order</label>
            <input required type="number" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#135D66]" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
          </div>
          
          {/* NEW PAGE DROPDOWN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Page</label>
            <select 
              required 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#135D66] bg-white cursor-pointer" 
              value={formData.page} 
              onChange={e => setFormData({...formData, page: e.target.value})}
            >
              <option value="Home">Home</option>
              <option value="About">About</option>
            </select>
          </div>

          <div className="md:col-span-6 flex gap-2 pt-2">
            <button type="submit" className="px-6 py-2 bg-[#135D66] text-white font-bold rounded-lg hover:bg-[#0E4950]">
              {isEditing ? "Update" : "Add Stat"}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(null); setFormData({ label: "", value: 0, suffix: "+", order: 0, page: "Home" }); }} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
    </div>
  );
}
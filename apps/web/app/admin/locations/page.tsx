"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Location {
  id: string;
  slug: string;
  title: string;
  bannerImage?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations`);
      const data = await res.json();
      if (data.status === "success") setLocations(data.data);
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setLocations(locations.filter(l => l.id !== id));
      else alert(data.message || "Failed to delete.");
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link href="/admin" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group">
            <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Manage Locations</h1>
          <p className="text-gray-500 font-medium mt-1">Create and edit destination landing pages.</p>
        </div>
        <Link href="/admin/locations/editor" className="px-6 py-3 bg-[#E59A1D] hover:bg-[#c98616] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Location
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><p className="text-gray-500 font-bold">Loading...</p></div>
        ) : locations.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Locations Found</h3>
            <p className="text-gray-500">Create your first destination landing page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Location</th>
                  <th className="p-4">Slug (URL)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                          {loc.bannerImage ? <Image src={loc.bannerImage} alt={loc.title} fill unoptimized className="object-cover" /> : null}
                        </div>
                        <p className="font-extrabold text-gray-900 text-base">{loc.title}</p>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-gray-500">/destinations/{loc.slug}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${loc.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {loc.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/locations/editor?slug=${loc.slug}`} className="p-2 text-gray-400 hover:text-[#E59A1D] hover:bg-orange-50 rounded-lg">Edit</Link>
                        <button onClick={() => handleDelete(loc.id, loc.title)} disabled={isDeleting === loc.id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
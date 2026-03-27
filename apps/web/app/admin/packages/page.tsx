// apps/web/app/admin/packages/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Package {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  isPublished: boolean;
  createdAt: string;
  bannerImage?: string;
}

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages`);
      const data = await res.json();
      if (data.status === "success") {
        setPackages(data.data);
        setFilteredPackages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch packages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPackages(packages);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = packages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query) ||
          pkg.category.toLowerCase().includes(query) ||
          pkg.location.toLowerCase().includes(query)
      );
      setFilteredPackages(filtered);
    }
  }, [searchQuery, packages]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the package: "${title}"?\nThis action cannot be undone.`)) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success") setPackages(packages.filter(p => p.id !== id));
      else alert(data.message || "Failed to delete package.");
    } catch (error) {
      alert("Network error occurred while trying to delete.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen bg-gray-50">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Manage Packages</h1>
          <p className="text-gray-500 font-medium mt-1">Create, edit, and manage your adventure itineraries.</p>
        </div>
        <Link 
          href="/admin/packages/editor" 
          className="px-6 py-3 bg-[#E59A1D] hover:bg-[#c98616] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Create New Package
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search packages by title, category, or location..." 
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
             <p className="text-gray-500 font-bold">Loading Packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Packages Found</h3>
            <p className="text-gray-500 font-medium">Get started by creating your first adventure itinerary.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Package Details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                          {pkg.bannerImage ? (
                            <Image src={pkg.bannerImage} alt={pkg.title} fill unoptimized className="object-cover" />
                          ) : (
                            <svg className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-base">{pkg.title}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">Created: {new Date(pkg.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="font-bold text-gray-700">{pkg.location || "N/A"}</span></td>
                    <td className="p-4"><span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#E9F4F5] text-[#135D66] border border-[#135D66]/20">{pkg.category}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${pkg.isPublished ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.isPublished ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {pkg.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/packages/${pkg.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-[#135D66] hover:bg-[#E9F4F5] rounded-lg transition-all" title="View on Website">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <Link href={`/admin/packages/editor?slug=${pkg.slug}`} className="p-2 text-gray-400 hover:text-[#E59A1D] hover:bg-orange-50 rounded-lg transition-all" title="Edit Package">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(pkg.id, pkg.title)} disabled={isDeleting === pkg.id} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Delete Package">
                          {isDeleting === pkg.id ? <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                        </button>
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
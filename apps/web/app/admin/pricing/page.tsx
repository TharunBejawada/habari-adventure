"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PricingAdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI Filtering State
  const [formLocation, setFormLocation] = useState<string>("");
  const [tableLocationFilter, setTableLocationFilter] = useState<string>("All");

  // Form State
  const [formData, setFormData] = useState({
    packageId: "",
    tier1: "",
    tier2: "",
    tier3: "",
    tier4: ""
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, pkgRes, priceRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/packages`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pricing`)
        ]);
        
        const locData = await locRes.json();
        const pkgData = await pkgRes.json();
        const priceData = await priceRes.json();
        
        if (locData.status === "success") setLocations(locData.data);
        if (pkgData.status === "success") setPackages(pkgData.data);
        if (priceData.status === "success") setPricingList(priceData.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // SMART AUTO-FILL: When a package is selected, check if it already has pricing
  useEffect(() => {
    if (formData.packageId) {
      const existingPricing = pricingList.find(p => p.packageId === formData.packageId);
      if (existingPricing) {
        setFormData({
          packageId: existingPricing.packageId,
          tier1: existingPricing.tier1.toString(),
          tier2: existingPricing.tier2.toString(),
          tier3: existingPricing.tier3.toString(),
          tier4: existingPricing.tier4.toString(),
        });
      } else {
        // Clear tiers if it's a new package
        setFormData(prev => ({ ...prev, tier1: "", tier2: "", tier3: "", tier4: "" }));
      }
    }
  }, [formData.packageId, pricingList]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLocation || !formData.packageId) {
      alert("Please select both a Location and a Package.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pricing`, {
        method: "POST", // The backend handles this as an UPSERT
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.status === "success") {
        // Update local list (replace if exists, add if new)
        const exists = pricingList.some(p => p.id === data.data.id);
        if (exists) {
          setPricingList(pricingList.map(p => p.id === data.data.id ? data.data : p));
        } else {
          setPricingList([data.data, ...pricingList]);
        }
        alert("Pricing matrix saved successfully!");
        setFormData({ packageId: "", tier1: "", tier2: "", tier3: "", tier4: "" });
        setFormLocation(""); // Reset location as well
      } else {
        alert(data.message || "Failed to save pricing.");
      }
    } catch (err) {
      alert("Error saving pricing.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this pricing matrix?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pricing/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      setPricingList(pricingList.filter(p => p.id !== id));
      // If deleted while form is active, clear form
      if (pricingList.find(p => p.id === id)?.packageId === formData.packageId) {
         setFormData({ packageId: "", tier1: "", tier2: "", tier3: "", tier4: "" });
         setFormLocation("");
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // --- Derived State for UI ---
  const isUpdating = pricingList.some(p => p.packageId === formData.packageId);
  const availableFormPackages = packages.filter(p => p.location === formLocation);
  
  const filteredTablePricing = tableLocationFilter === "All" 
    ? pricingList 
    : pricingList.filter(p => p.package?.location === tableLocationFilter);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3 inline-block">← Back to Dashboard</Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Package Pricing</h1>
          <p className="text-gray-500 font-medium">Manage per-person costs based on group size.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Pricing Form */}
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5 sticky top-8">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-[#135D66]">Pricing Matrix</h3>
              {isUpdating && <span className="text-xs font-bold text-[#E59A1D] bg-orange-50 px-2 py-1 rounded">Editing Existing</span>}
            </div>
            
            {/* NEW: Dependent Dropdowns */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Location *</label>
                <select 
                  required 
                  className={`w-full p-3 border rounded-xl outline-none transition-colors cursor-pointer ${
                    !formLocation ? 'border-red-300 bg-red-50 text-gray-400' : 'border-gray-300 bg-white focus:border-[#135D66] text-gray-900 font-medium'
                  }`}
                  value={formLocation} 
                  onChange={e => {
                    setFormLocation(e.target.value);
                    setFormData({...formData, packageId: ""}); // Reset package when location changes
                  }}
                >
                  <option value="" disabled hidden>-- Choose a Location --</option>
                  {locations.map(loc => <option key={loc.id} value={loc.title} className="text-gray-900">{loc.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Package *</label>
                <select 
                  required 
                  disabled={!formLocation}
                  className={`w-full p-3 border rounded-xl outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    !formData.packageId && formLocation ? 'border-red-300 bg-red-50 text-gray-400' : 'border-gray-300 bg-white focus:border-[#135D66] text-gray-900 font-medium'
                  }`}
                  value={formData.packageId} 
                  onChange={e => setFormData({...formData, packageId: e.target.value})}
                >
                  <option value="" disabled hidden>
                    {!formLocation ? "Select a location first" : "-- Choose a Package --"}
                  </option>
                  {availableFormPackages.map(p => <option key={p.id} value={p.id} className="text-gray-900">{p.title}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Per Person Cost (USD)</p>
              
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700">Solo (1 Person)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" value={formData.tier1} onChange={e => setFormData({...formData, tier1: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700">Small Group (2-4 Pax)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" value={formData.tier2} onChange={e => setFormData({...formData, tier2: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700">Medium Group (5-9 Pax)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" value={formData.tier3} onChange={e => setFormData({...formData, tier3: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700">Large Group (10+ Pax)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" value={formData.tier4} onChange={e => setFormData({...formData, tier4: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSaving || !formData.packageId || !formLocation} className="w-full mt-4 py-3.5 bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] font-extrabold rounded-xl transition-all disabled:opacity-50 shadow-md">
              {isSaving ? "Saving..." : (isUpdating ? "Update Pricing Matrix" : "Save Pricing Matrix")}
            </button>
          </form>
        </div>

        {/* RIGHT: Display Table */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* NEW: Table Filter Bar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Saved Matrices</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-500">Filter:</label>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm font-medium outline-none focus:border-[#135D66] shadow-sm cursor-pointer"
                  value={tableLocationFilter}
                  onChange={(e) => setTableLocationFilter(e.target.value)}
                >
                  <option value="All">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.title}>{loc.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-bold">Loading pricing...</div>
            ) : filteredTablePricing.length === 0 ? (
              <div className="p-16 text-center text-gray-500 font-medium">
                {tableLocationFilter === "All" 
                  ? "No pricing models have been set up yet." 
                  : `No pricing models found for ${tableLocationFilter}.`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Location</th>
                      <th className="p-4">Package</th>
                      <th className="p-4 text-center">1 Pax</th>
                      <th className="p-4 text-center">2-4 Pax</th>
                      <th className="p-4 text-center">5-9 Pax</th>
                      <th className="p-4 text-center">10+ Pax</th>
                      <th className="p-4 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTablePricing.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          {/* Display the location attached to the package */}
                          <span className="inline-flex px-2 py-1 rounded bg-[#E9F4F5] text-[#135D66] font-bold text-xs">
                            {p.package?.location || "Unknown"}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-extrabold text-gray-900 text-sm">{p.package?.title}</p>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-800">${p.tier1}</td>
                        <td className="p-4 text-center font-bold text-gray-800">${p.tier2}</td>
                        <td className="p-4 text-center font-bold text-gray-800">${p.tier3}</td>
                        <td className="p-4 text-center font-bold text-gray-800">${p.tier4}</td>
                        <td className="p-4 text-right pr-6">
                          <button 
                            onClick={() => {
                              // NEW: Auto-select the correct location so the dropdown tree works!
                              setFormLocation(p.package?.location || "");
                              setFormData({ 
                                packageId: p.packageId, 
                                tier1: p.tier1.toString(), 
                                tier2: p.tier2.toString(), 
                                tier3: p.tier3.toString(), 
                                tier4: p.tier4.toString() 
                              });
                            }} 
                            className="text-[#E59A1D] hover:underline font-bold text-xs mr-3"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
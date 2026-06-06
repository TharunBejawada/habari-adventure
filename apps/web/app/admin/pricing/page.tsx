"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch, getAdminToken } from "../../../lib/apiClient";

const DEFAULT_FORM_STATE = {
  packageId: "", pricingType: "Standard",
  tier1: "", tier2: "", tier3: "", tier4: "",
  campTier1: "", campTier2: "", campTier3: "", campTier4: "",
  midTier1: "", midTier2: "", midTier3: "", midTier4: "",
  luxTier1: "", luxTier2: "", luxTier3: "", luxTier4: ""
};

export default function PricingAdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI Filtering State
  const [formLocation, setFormLocation] = useState<string>("");
  const [tableLocationFilter, setTableLocationFilter] = useState<string>("All");
  
  // NEW: Active Tab State for Category Mode
  const [activeTab, setActiveTab] = useState<"Camping" | "MidRange" | "Luxury">("Camping");

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locResult, pkgResult, priceResult] = await Promise.all([
          apiFetch("/locations"),
          apiFetch("/packages"),
          apiFetch("/pricing")
        ]);

        if (locResult.ok && locResult.data) setLocations(locResult.data);
        if (pkgResult.ok && pkgResult.data) setPackages(pkgResult.data);
        if (priceResult.ok && priceResult.data) setPricingList(priceResult.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // SMART AUTO-FILL
  useEffect(() => {
    if (formData.packageId) {
      const existingPricing = pricingList.find(p => p.packageId === formData.packageId);
      if (existingPricing) {
        setFormData({
          packageId: existingPricing.packageId,
          pricingType: existingPricing.pricingType || "Standard",
          tier1: existingPricing.tier1?.toString() || "",
          tier2: existingPricing.tier2?.toString() || "",
          tier3: existingPricing.tier3?.toString() || "",
          tier4: existingPricing.tier4?.toString() || "",
          campTier1: existingPricing.campTier1?.toString() || "",
          campTier2: existingPricing.campTier2?.toString() || "",
          campTier3: existingPricing.campTier3?.toString() || "",
          campTier4: existingPricing.campTier4?.toString() || "",
          midTier1: existingPricing.midTier1?.toString() || "",
          midTier2: existingPricing.midTier2?.toString() || "",
          midTier3: existingPricing.midTier3?.toString() || "",
          midTier4: existingPricing.midTier4?.toString() || "",
          luxTier1: existingPricing.luxTier1?.toString() || "",
          luxTier2: existingPricing.luxTier2?.toString() || "",
          luxTier3: existingPricing.luxTier3?.toString() || "",
          luxTier4: existingPricing.luxTier4?.toString() || "",
        });
        setActiveTab("Camping"); // Reset tab on load
      } else {
        setFormData(prev => ({ ...DEFAULT_FORM_STATE, packageId: prev.packageId }));
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
      const { ok, data, error } = await apiFetch("/pricing", {
        method: "POST", 
        token: getAdminToken(),
        body: JSON.stringify(formData)
      });

      if (ok && data) {
        const exists = pricingList.some(p => p.id === data.id);
        if (exists) {
          setPricingList(pricingList.map(p => p.id === data.id ? data : p));
        } else {
          setPricingList([data, ...pricingList]);
        }
        alert("Pricing matrix saved successfully!");
        setFormData(DEFAULT_FORM_STATE);
        setFormLocation(""); 
      } else {
        alert(error || "Failed to save pricing.");
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
      await apiFetch(`/pricing/${id}`, {
        method: "DELETE",
        token: getAdminToken()
      });
      setPricingList(pricingList.filter(p => p.id !== id));
      if (pricingList.find(p => p.id === id)?.packageId === formData.packageId) {
         setFormData(DEFAULT_FORM_STATE);
         setFormLocation("");
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const isUpdating = pricingList.some(p => p.packageId === formData.packageId);
  const availableFormPackages = packages.filter(p => p.location === formLocation);
  
  const filteredTablePricing = tableLocationFilter === "All" 
    ? pricingList 
    : pricingList.filter(p => p.package?.location === tableLocationFilter);

  const isStandard = formData.pricingType === "Standard";

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-gray-900">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-[#135D66] mb-3 inline-block">← Back to Dashboard</Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#135D66]">Package Pricing</h1>
          <p className="text-gray-500 font-medium">Manage per-person costs based on group size.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Pricing Form */}
        <div className="w-full lg:w-[40%] xl:w-1/3">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5 sticky top-8">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-[#135D66]">Pricing Matrix</h3>
              {isUpdating && <span className="text-xs font-bold text-[#fe6e00] bg-orange-50 px-2 py-1 rounded">Editing Existing</span>}
            </div>
            
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
                    setFormData({...formData, packageId: ""}); 
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

            {/* Pricing Type Toggle */}
            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Pricing Group Style *</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${formData.pricingType === "Standard" ? "bg-[#E9F4F5] border-[#135D66] text-[#135D66]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <input type="radio" name="pricingType" value="Standard" checked={formData.pricingType === "Standard"} onChange={(e) => setFormData({...formData, pricingType: e.target.value})} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.pricingType === "Standard" ? "border-[#135D66]" : "border-gray-300"}`}>
                    {formData.pricingType === "Standard" && <div className="w-2 h-2 rounded-full bg-[#135D66]"></div>}
                  </div>
                  <span className="text-sm font-bold">Standard</span>
                </label>
                <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${formData.pricingType === "Category" ? "bg-[#E9F4F5] border-[#135D66] text-[#135D66]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <input type="radio" name="pricingType" value="Category" checked={formData.pricingType === "Category"} onChange={(e) => setFormData({...formData, pricingType: e.target.value})} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.pricingType === "Category" ? "border-[#135D66]" : "border-gray-300"}`}>
                    {formData.pricingType === "Category" && <div className="w-2 h-2 rounded-full bg-[#135D66]"></div>}
                  </div>
                  <span className="text-sm font-bold">Category (Safari)</span>
                </label>
              </div>
            </div>

            {/* DYNAMIC FORM RENDERING */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Per Person Cost (USD)</p>
                 {!isStandard && <span className="text-xs font-bold text-[#fe6e00]">{activeTab} Pricing</span>}
              </div>
              
              {!isStandard && (
                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-4">
                   <button type="button" onClick={() => setActiveTab("Camping")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Camping' ? 'bg-white shadow-sm text-[#135D66]' : 'text-gray-500 hover:text-gray-700'}`}>Camping</button>
                   <button type="button" onClick={() => setActiveTab("MidRange")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'MidRange' ? 'bg-white shadow-sm text-[#135D66]' : 'text-gray-500 hover:text-gray-700'}`}>Mid-Range</button>
                   <button type="button" onClick={() => setActiveTab("Luxury")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Luxury' ? 'bg-white shadow-sm text-[#135D66]' : 'text-gray-500 hover:text-gray-700'}`}>Luxury</button>
                </div>
              )}

              {/* Tier 1 (1 Person) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="text-sm font-bold text-gray-700">1 Person (Solo)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" 
                    value={isStandard ? formData.tier1 : activeTab === 'Camping' ? formData.campTier1 : activeTab === 'MidRange' ? formData.midTier1 : formData.luxTier1} 
                    onChange={e => {
                      const val = e.target.value;
                      if (isStandard) setFormData({...formData, tier1: val});
                      else if (activeTab === 'Camping') setFormData({...formData, campTier1: val});
                      else if (activeTab === 'MidRange') setFormData({...formData, midTier1: val});
                      else setFormData({...formData, luxTier1: val});
                    }} 
                  />
                </div>
              </div>

              {/* Tier 2 (2 Pax) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {/* <label className="text-sm font-bold text-gray-700">{isStandard ? "2-4 People (Small Group)" : "2 People"}</label> */}
                <label className="text-sm font-bold text-gray-700">2-4 People (Small Group)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" 
                    value={isStandard ? formData.tier2 : activeTab === 'Camping' ? formData.campTier2 : activeTab === 'MidRange' ? formData.midTier2 : formData.luxTier2} 
                    onChange={e => {
                      const val = e.target.value;
                      if (isStandard) setFormData({...formData, tier2: val});
                      else if (activeTab === 'Camping') setFormData({...formData, campTier2: val});
                      else if (activeTab === 'MidRange') setFormData({...formData, midTier2: val});
                      else setFormData({...formData, luxTier2: val});
                    }} 
                  />
                </div>
              </div>

              {/* Tier 3 (3 Pax) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {/* <label className="text-sm font-bold text-gray-700">{isStandard ? "5-9 People (Medium Group)" : "3 People"}</label> */}
                <label className="text-sm font-bold text-gray-700">5-9 People (Medium Group)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" 
                    value={isStandard ? formData.tier3 : activeTab === 'Camping' ? formData.campTier3 : activeTab === 'MidRange' ? formData.midTier3 : formData.luxTier3} 
                    onChange={e => {
                      const val = e.target.value;
                      if (isStandard) setFormData({...formData, tier3: val});
                      else if (activeTab === 'Camping') setFormData({...formData, campTier3: val});
                      else if (activeTab === 'MidRange') setFormData({...formData, midTier3: val});
                      else setFormData({...formData, luxTier3: val});
                    }} 
                  />
                </div>
              </div>

              {/* Tier 4 (4+ Pax) */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {/* <label className="text-sm font-bold text-gray-700">{isStandard ? "10+ People (Large Group)" : "4+ People"}</label> */}
                <label className="text-sm font-bold text-gray-700">10+ People (Large Group)</label>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" required min="0" className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#135D66] font-bold" 
                    value={isStandard ? formData.tier4 : activeTab === 'Camping' ? formData.campTier4 : activeTab === 'MidRange' ? formData.midTier4 : formData.luxTier4} 
                    onChange={e => {
                      const val = e.target.value;
                      if (isStandard) setFormData({...formData, tier4: val});
                      else if (activeTab === 'Camping') setFormData({...formData, campTier4: val});
                      else if (activeTab === 'MidRange') setFormData({...formData, midTier4: val});
                      else setFormData({...formData, luxTier4: val});
                    }} 
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSaving || !formData.packageId || !formLocation} className="cursor-pointer w-full mt-4 py-3.5 bg-[#fe6e00] hover:bg-[#fe6e00] text-[#135D66] font-extrabold rounded-xl transition-all disabled:opacity-50 shadow-md">
              {isSaving ? "Saving..." : (isUpdating ? "Update Pricing Matrix" : "Save Pricing Matrix")}
            </button>
          </form>
        </div>

        {/* RIGHT: Display Table */}
        <div className="w-full lg:w-[60%] xl:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
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
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Location</th>
                      <th className="p-4">Package</th>
                      <th className="p-4 text-center">Tier 1</th>
                      <th className="p-4 text-center">Tier 2</th>
                      <th className="p-4 text-center">Tier 3</th>
                      <th className="p-4 text-center">Tier 4</th>
                      <th className="p-4 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTablePricing.map((p) => {
                      const isStd = p.pricingType === "Standard" || !p.pricingType;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6 align-top">
                            <span className="inline-flex px-2 py-1 rounded bg-[#E9F4F5] text-[#135D66] font-bold text-xs">
                              {p.package?.location || "Unknown"}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-extrabold text-gray-900 text-sm leading-tight">{p.package?.title}</p>
                            <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${isStd ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-700"}`}>
                              {isStd ? "Standard Mode" : "Category Mode"}
                            </span>
                          </td>
                          
                          {/* Dynamic Tier Cells */}
                          <td className="p-4 text-center align-top">
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">1 Pax</div>
                            {isStd ? (
                              <div className="font-bold text-gray-800">${p.tier1}</div>
                            ) : (
                              <div className="flex flex-col gap-1.5 text-xs text-left w-max mx-auto">
                                <span className="text-gray-700">🏕️ <span className="font-bold text-gray-900 ml-1">${p.campTier1 || 0}</span></span>
                                <span className="text-gray-700">🏨 <span className="font-bold text-gray-900 ml-1">${p.midTier1 || 0}</span></span>
                                <span className="text-gray-700">💎 <span className="font-bold text-gray-900 ml-1">${p.luxTier1 || 0}</span></span>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4 text-center align-top">
                            {/* <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">{isStd ? "2-4 Pax" : "2 Pax"}</div> */}
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">2-4 Pax</div>
                            {isStd ? (
                              <div className="font-bold text-gray-800">${p.tier2}</div>
                            ) : (
                              <div className="flex flex-col gap-1.5 text-xs text-left w-max mx-auto">
                                <span className="text-gray-700">🏕️ <span className="font-bold text-gray-900 ml-1">${p.campTier2 || 0}</span></span>
                                <span className="text-gray-700">🏨 <span className="font-bold text-gray-900 ml-1">${p.midTier2 || 0}</span></span>
                                <span className="text-gray-700">💎 <span className="font-bold text-gray-900 ml-1">${p.luxTier2 || 0}</span></span>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4 text-center align-top">
                            {/* <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">{isStd ? "5-9 Pax" : "3 Pax"}</div> */}
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">5-9 Pax</div>
                            {isStd ? (
                              <div className="font-bold text-gray-800">${p.tier3}</div>
                            ) : (
                              <div className="flex flex-col gap-1.5 text-xs text-left w-max mx-auto">
                                <span className="text-gray-700">🏕️ <span className="font-bold text-gray-900 ml-1">${p.campTier3 || 0}</span></span>
                                <span className="text-gray-700">🏨 <span className="font-bold text-gray-900 ml-1">${p.midTier3 || 0}</span></span>
                                <span className="text-gray-700">💎 <span className="font-bold text-gray-900 ml-1">${p.luxTier3 || 0}</span></span>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4 text-center align-top">
                            {/* <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">{isStd ? "10+ Pax" : "4+ Pax"}</div> */}
                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">10+ Pax</div>
                            {isStd ? (
                              <div className="font-bold text-gray-800">${p.tier4}</div>
                            ) : (
                              <div className="flex flex-col gap-1.5 text-xs text-left w-max mx-auto">
                                <span className="text-gray-700">🏕️ <span className="font-bold text-gray-900 ml-1">${p.campTier4 || 0}</span></span>
                                <span className="text-gray-700">🏨 <span className="font-bold text-gray-900 ml-1">${p.midTier4 || 0}</span></span>
                                <span className="text-gray-700">💎 <span className="font-bold text-gray-900 ml-1">${p.luxTier4 || 0}</span></span>
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-right pr-6 align-top pt-8">
                            <button 
                              onClick={() => {
                                setFormLocation(p.package?.location || "");
                                setFormData({
                                  packageId: p.packageId,
                                  pricingType: p.pricingType || "Standard",
                                  tier1: p.tier1?.toString() || "",
                                  tier2: p.tier2?.toString() || "",
                                  tier3: p.tier3?.toString() || "",
                                  tier4: p.tier4?.toString() || "",
                                  campTier1: p.campTier1?.toString() || "",
                                  campTier2: p.campTier2?.toString() || "",
                                  campTier3: p.campTier3?.toString() || "",
                                  campTier4: p.campTier4?.toString() || "",
                                  midTier1: p.midTier1?.toString() || "",
                                  midTier2: p.midTier2?.toString() || "",
                                  midTier3: p.midTier3?.toString() || "",
                                  midTier4: p.midTier4?.toString() || "",
                                  luxTier1: p.luxTier1?.toString() || "",
                                  luxTier2: p.luxTier2?.toString() || "",
                                  luxTier3: p.luxTier3?.toString() || "",
                                  luxTier4: p.luxTier4?.toString() || "",
                                });
                                setActiveTab("Camping");
                              }} 
                              className="text-[#fe6e00] hover:underline font-bold text-xs mr-3"
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">
                              Delete
                            </button>
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

      </div>
    </div>
  );
}
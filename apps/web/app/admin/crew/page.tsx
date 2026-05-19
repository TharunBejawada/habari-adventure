// apps/web/app/admin/crew/page.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import Link from "next/link";
import { apiFetch, getAdminToken } from "../../../lib/apiClient";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminCrewDashboard() {
  const [activeTab, setActiveTab] = useState("settings");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // States
  const [settings, setSettings] = useState({ heroBannerImage: "", porterBannerImage: "", porterDescription: "" });
  const [teams, setTeams] = useState<any[]>([]);

  // Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<any>({});
  const [currentMember, setCurrentMember] = useState<any>({});

  // --- 1. FETCH DATA ---
  const fetchCrewData = async () => {
    try {
      const { ok, data } = await apiFetch("/crew");
      if (ok && data) {
        setSettings(data.settings || { heroBannerImage: "", porterBannerImage: "", porterDescription: "" });
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error("Error fetching crew data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrewData();
  }, []);

  // --- 2. FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: Function, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("folder", "crew"); 
    formData.append("asset", file);
    

    try {
      // Assuming you have a generic upload endpoint
      const { ok, data: responseData } = await apiFetch("/upload", {
        method: "POST",
        token: getAdminToken(),
        body: formData,
      });
      const uploadedUrl = responseData?.url;
      if (ok && uploadedUrl) {
        setter((prev: any) => ({ ...prev, [fieldName]: uploadedUrl }));
      } else {
        console.error("Backend response:", responseData);
        alert("Upload succeeded, but backend didn't return a valid URL.");
      }
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- 3. SAVE HANDLERS ---
  const handleSettingsSave = async () => {
    try {
      const { ok } = await apiFetch("/crew/settings", {
        method: "POST",
        token: getAdminToken(),
        body: JSON.stringify(settings),
      });
      if (ok) alert("Page Settings Saved Successfully!");
    } catch (err) {
      alert("Error saving settings.");
    }
  };

  const handleTeamSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/crew/team", {
        method: "POST",
        token: getAdminToken(),
        body: JSON.stringify(currentTeam),
      });
      setIsTeamModalOpen(false);
      fetchCrewData(); // Refresh list
    } catch (err) {
      alert("Error saving team.");
    }
  };

  const handleMemberSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/crew/member", {
        method: "POST",
        token: getAdminToken(),
        body: JSON.stringify(currentMember),
      });
      setIsMemberModalOpen(false);
      fetchCrewData(); // Refresh list
    } catch (err) {
      alert("Error saving member.");
    }
  };

  const handleDelete = async (type: "team" | "member", id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await apiFetch(`/crew/${type}/${id}`, {
        method: "DELETE",
        token: getAdminToken(),
      });
      fetchCrewData();
    } catch (err) {
      alert("Error deleting.");
    }
  };

  // Safely strips HTML, converts &nbsp;, and limits characters
  const truncateForPreview = (html: string, charLimit: number = 120) => {
    if (!html) return "";
    // 1. Replace &nbsp; with space
    // 2. Strip all HTML tags
    const plainText = html.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();
    
    if (plainText.length <= charLimit) return plainText;
    return plainText.substring(0, charLimit) + "...";
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-600">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
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
          <h1 className="text-3xl font-extrabold text-[#135D66]">Manage 'Our Crew'</h1>
          <p className="text-gray-500 mt-1">Configure banners, teams, and individual crew members.</p>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "settings" ? "border-[#fe6e00] text-[#fe6e00]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          Page Banners & Porter Section
        </button>
        <button 
          onClick={() => setActiveTab("teams")}
          className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "teams" ? "border-[#fe6e00] text-[#fe6e00]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          Teams & Members
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PAGE SETTINGS & PORTERS             */}
      {/* ========================================== */}
      {activeTab === "settings" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Hero Banner */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Main Page Hero Banner</h3>
            <div className="relative w-full h-[300px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:bg-gray-100 transition-colors">
              {settings.heroBannerImage ? (
                <>
                  <img src={settings.heroBannerImage} className="w-full h-full object-cover" alt="Hero Banner" />
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    <FaImage className="mr-2" /> Change Hero Banner
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center flex flex-col items-center">
                  {isUploading ? <FaSpinner className="animate-spin text-3xl mb-2" /> : <FaImage className="text-4xl mb-2 text-gray-300"/>}
                  <span className="font-medium text-gray-600">Click to upload full-width Hero Banner</span>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setSettings, "heroBannerImage")} />
            </div>
          </div>

          {/* Porter Team Section */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Porter Team Section</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Porter Section Banner Image</label>
                <div className="relative w-full h-[250px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:bg-gray-100 transition-colors">
                  {settings.porterBannerImage ? (
                    <>
                      <img src={settings.porterBannerImage} className="w-full h-full object-cover" alt="Porter Banner" />
                      <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                        <FaImage className="mr-2" /> Change Porter Banner
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-center flex flex-col items-center">
                      {isUploading ? <FaSpinner className="animate-spin text-3xl mb-2" /> : <FaImage className="text-4xl mb-2 text-gray-300"/>}
                      <span className="font-medium text-gray-600">Click to upload Porter Banner</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setSettings, "porterBannerImage")} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Porter Section Description</label>
                <div className="bg-white text-gray-900">
                  <ReactQuill 
                    theme="snow" 
                    value={settings.porterDescription} 
                    onChange={(val) => setSettings({...settings, porterDescription: val})} 
                    className="h-48 mb-12 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSettingsSave} className="bg-[#135D66] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-[#0f4a52] transition-all text-lg">
              Save Page Settings
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: TEAMS & MEMBERS                     */}
      {/* ========================================== */}
      {activeTab === "teams" && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => { setCurrentTeam({}); setIsTeamModalOpen(true); }}
              className="bg-[#fe6e00] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#c98618] transition-all flex items-center gap-2"
            >
              <FaPlus /> Add New Team Category
            </button>
          </div>

          <div className="space-y-8">
            {teams.length === 0 && (
              <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
                No teams created yet. Click "Add New Team Category" to get started.
              </div>
            )}

            {teams.map((team) => (
              <div key={team.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Team Header */}
                <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#135D66]">
                      {team.name} <span className="text-sm font-medium text-gray-400 ml-2">(Priority: {team.priorityOrder})</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setCurrentMember({ teamId: team.id }); setIsMemberModalOpen(true); }} 
                      className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaPlus/> Add Member
                    </button>
                    <button onClick={() => { setCurrentTeam(team); setIsTeamModalOpen(true); }} className="text-gray-400 hover:text-[#135D66]"><FaEdit /></button>
                    <button onClick={() => handleDelete("team", team.id)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                  </div>
                </div>
                
                {/* Team Members Grid */}
                <div className="p-6">
                  {team.members?.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No members in this team yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {team.members.map((member: any) => (
  <div key={member.id} className="border border-gray-200 rounded-xl p-5 flex gap-5 items-start hover:shadow-md transition-all relative group bg-white">
    
    {/* 1. LARGER VERTICAL RECTANGLE IMAGE */}
    <div className="w-28 h-44 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200 shadow-sm">
      <img 
        src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=135D66&color=fff`} 
        alt={member.name} 
        className="w-full h-full object-cover object-top" 
      />
    </div>
    
    <div className="flex-1 pr-6">
      <h4 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h4>
      <p className="text-sm text-[#fe6e00] font-bold mb-3">{member.designation}</p>
      
      <p className="text-sm text-gray-600 leading-relaxed">
  {truncateForPreview(member.description, 150)}
</p>
    </div>

    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 bg-white/90 p-1 rounded-md backdrop-blur-sm shadow-sm border border-gray-100">
      <button onClick={() => { setCurrentMember(member); setIsMemberModalOpen(true); }} className="text-gray-500 hover:text-[#135D66] p-1.5"><FaEdit/></button>
      <button onClick={() => handleDelete("member", member.id)} className="text-gray-500 hover:text-red-500 p-1.5"><FaTrash/></button>
    </div>
    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Priority: {member.priorityOrder}</span>
  </div>
))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODALS                                     */}
      {/* ========================================== */}
      
      {/* Add/Edit Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-up">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{currentTeam.id ? 'Edit Team' : 'Create New Team'}</h3>
            <form onSubmit={handleTeamSave} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Name (e.g. Mountain Guides)</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white" placeholder="Enter team name" value={currentTeam.name || ""} onChange={e => setCurrentTeam({...currentTeam, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Priority Order</label>
                <input type="number" required min="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white" placeholder="1 is highest priority" value={currentTeam.priorityOrder || ""} onChange={e => setCurrentTeam({...currentTeam, priorityOrder: e.target.value})} />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first on the page.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#135D66] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#0f4a52] transition-colors shadow-md">Save Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">{currentMember.id ? 'Edit Crew Member' : 'Add Crew Member'}</h3>
            <form onSubmit={handleMemberSave} className="space-y-6">
              
              {/* Member Image Upload */}
<div className="flex flex-col items-center mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-2 self-start">Profile Image</label>
  {/* Changed from rounded-full w-32 h-32 to rounded-xl w-32 h-40 */}
  <div className="relative w-32 h-44 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:bg-gray-200 transition-colors">
    {currentMember.image ? (
      <>
        <img src={currentMember.image} className="w-full h-full object-cover object-top" alt="Profile" />
        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-bold text-center p-2 backdrop-blur-sm">Change Image</div>
      </>
    ) : (
      <div className="text-gray-400 flex flex-col items-center">
        {isUploading ? <FaSpinner className="animate-spin text-xl mb-1" /> : <FaImage className="text-2xl mb-1 text-gray-400"/>}
        <span className="text-[10px] font-bold text-gray-500 uppercase text-center mt-1">Upload<br/>Portrait</span>
      </div>
    )}
    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setCurrentMember, "image")} />
  </div>
</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white" placeholder="John Doe" value={currentMember.name || ""} onChange={e => setCurrentMember({...currentMember, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Designation / Role</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white" placeholder="Chief Guide" value={currentMember.designation || ""} onChange={e => setCurrentMember({...currentMember, designation: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Priority (Order within team)</label>
                <input type="number" required min="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#135D66] text-gray-900 placeholder-gray-400 bg-white" placeholder="1 is highest" value={currentMember.priorityOrder || ""} onChange={e => setCurrentMember({...currentMember, priorityOrder: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio / Description (RTE)</label>
                <div className="bg-white text-gray-900 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#135D66]">
                  <ReactQuill 
                    theme="snow" 
                    value={currentMember.description || ""} 
                    onChange={(val) => setCurrentMember({...currentMember, description: val})} 
                    className="h-32 mb-10 border-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#135D66] text-white px-8 py-2.5 rounded-full font-bold hover:bg-[#0f4a52] transition-colors shadow-md">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
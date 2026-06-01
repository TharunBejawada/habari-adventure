"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch, getAdminToken } from "../../../../lib/apiClient"; // Adjust path as needed

export default function AdminEmailSettingsPage() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    recipientTo: "",
    ccEmails: "",
    bccEmails: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { ok, data } = await apiFetch("/settings/email");
    if (ok && data) {
      setFormData({
        senderName: data.senderName || "",
        senderEmail: data.senderEmail || "",
        recipientTo: data.recipientTo || "",
        ccEmails: data.ccEmails || "",
        bccEmails: data.bccEmails || ""
      });
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { ok } = await apiFetch("/settings/email", {
      method: "PUT",
      token: getAdminToken(),
      body: JSON.stringify(formData),
    });

    if (ok) {
      alert("Email settings updated successfully!");
    } else {
      alert("Failed to update settings.");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading Configuration...</div>;

  return (
    <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors group">
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#135D66] mb-2">Email Configuration</h2>
        <p className="text-gray-500 font-medium">Manage where booking notifications are sent and who they are sent from.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Outgoing Settings (The Danger Zone) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-bold border-b pb-2 text-[#135D66]">Outgoing Emails (Sender)</h3>
          
          {/* WARNING BLOCK */}
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-red-700 font-bold mb-1">Caution: Changing Sender Email</h4>
                <p className="text-red-600 text-sm leading-relaxed">
                  Your mail server (SMTP) authenticates using a specific email address and password. If you change the <strong>Sender Email</strong> here, the mail server might reject the connection unless the backend SMTP password is also updated. If you are unsure, please contact your developer or hosting administrator before changing this field.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sender Name</label>
              <input 
                required type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]" 
                placeholder="e.g., Habari Adventure Info"
                value={formData.senderName} 
                onChange={e => setFormData({...formData, senderName: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sender Email <span className="text-red-500">*</span></label>
              <input 
                required type="email" 
                className="w-full px-4 py-3 border border-red-300 bg-red-50/50 rounded-xl outline-none focus:border-red-500" 
                placeholder="info@habariadventure.com"
                value={formData.senderEmail} 
                onChange={e => setFormData({...formData, senderEmail: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Incoming Settings */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          <h3 className="text-lg font-bold border-b pb-2 text-[#135D66]">Incoming Notifications (Admin)</h3>
          <p className="text-sm text-gray-500">You can add multiple email addresses by separating them with commas (e.g., <code className="bg-gray-100 px-1 rounded">email1@test.com, email2@test.com</code>).</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Primary Recipient(s) *</label>
              <input 
                required type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]" 
                placeholder="bejawada18@gmail.com, rkdeepakd@gmail.com"
                value={formData.recipientTo} 
                onChange={e => setFormData({...formData, recipientTo: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">CC Emails (Optional)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]" 
                placeholder="manager@domain.com, sales@domain.com"
                value={formData.ccEmails} 
                onChange={e => setFormData({...formData, ccEmails: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">BCC Emails (Optional)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#135D66]" 
                placeholder="audit@domain.com"
                value={formData.bccEmails} 
                onChange={e => setFormData({...formData, bccEmails: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="cursor-pointer px-10 py-3.5 bg-[#fe6e00] hover:bg-[#c98616] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 text-lg"
          >
            {isSaving ? "Saving Configuration..." : "Save Email Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
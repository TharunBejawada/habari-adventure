// apps/web/components/contact/ContactFormSection.tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Caveat } from "next/font/google";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function ContactFormSection() {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Form State Updated for Client Feedback
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    monthYear: "",
    length: "",
    groupSize: "",
    include: "",
    message: ""
  });

  // Get current YYYY-MM to prevent past date selection
  const [minMonth, setMinMonth] = useState("");
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    setMinMonth(`${yyyy}-${mm}`);
  }, []);

  // 1. Scroll Intersection Observer for Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          // Unobserve so it only animates once
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.15 } // Trigger when 15% of the section is visible
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (value: string | null) => {
    setIsCaptchaVerified(!!value); // If value exists, it's verified
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) return; 
    
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Quote request sent successfully! We will get back to you shortly.");
        // Clear the form on success
        setFormData({
          firstName: "", lastName: "", email: "", phone: "",
          monthYear: "", length: "", groupSize: "", include: "", message: ""
        });
        // Optional: Reset captcha here if you have a ref to it
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if required fields are filled to enable button (excludes lastName and phone)
  const isFormValid = 
    formData.firstName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.monthYear.trim() !== "" &&
    formData.length.trim() !== "" &&
    formData.groupSize.trim() !== "" &&
    formData.include.trim() !== "" &&
    formData.message.trim() !== "" &&
    isCaptchaVerified;

  return (
    <section ref={sectionRef} className="w-full py-20 lg:py-32 bg-white relative overflow-hidden z-10">
      
      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade-left-scroll {
            animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-fade-right-scroll {
            animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `
      }} />

      <div className="max-w-[1300px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-16 lg:gap-12 items-start">
        
        {/* ========================================== */}
        {/* LEFT SIDE: CONTACT CARDS & CHEAT SHEET     */}
        {/* ========================================== */}
        <div className={`w-full lg:w-[45%] flex flex-col pt-4 opacity-0 ${isVisible ? 'animate-fade-left-scroll' : ''}`}>
          
          <h2 className="text-4xl font-extrabold text-[#135D66] mb-2">
            Contact Us <span className="text-[#E59A1D]">Detail</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-10 leading-relaxed max-w-md">
            Habari Adventure is a locally operated, certified tour operator in Tanzania. Our friendly team is always here to chat and plan your perfect trip.
          </p>

          {/* Contact Cards Container (Clickable Actions) */}
          <div className="flex flex-col gap-8 mb-12">
            
            {/* Phone/WhatsApp Card */}
            <a href="tel:+255762992308" className="flex items-center gap-6 group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#4A8E9A] text-white flex items-center justify-center text-xl md:text-2xl shadow-md group-hover:scale-110 group-hover:bg-[#25D366] transition-all duration-300">
                <FaPhoneAlt />
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">WhatsApp / Phone</span>
                <span className="block text-[#135D66] font-extrabold text-lg md:text-xl group-hover:text-[#25D366] transition-colors">+255 762 992 308</span>
              </div>
            </a>

            {/* Email Card */}
            <a href="mailto:habariadventure@gmail.com" className="flex items-center gap-6 group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#D48A96] text-white flex items-center justify-center text-xl md:text-2xl shadow-md group-hover:scale-110 group-hover:bg-[#E59A1D] transition-all duration-300">
                <FaEnvelope />
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Email</span>
                <span className="block text-[#135D66] font-extrabold text-lg md:text-xl break-all group-hover:text-[#E59A1D] transition-colors">habariadventure@gmail.com</span>
              </div>
            </a>

            {/* Address Card (Opens Google Maps) */}
            <a href="https://maps.google.com/?q=Moshi,Kilimanjaro,Tanzania" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0E4950] text-white flex items-center justify-center text-xl md:text-2xl shadow-md group-hover:scale-110 transition-all duration-300">
                <FaMapMarkerAlt />
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Address</span>
                <span className="block text-[#135D66] font-extrabold text-lg md:text-xl">P.O Box 8029, Moshi–Kili, TZ</span>
              </div>
            </a>

          </div>

          {/* "Prefer to talk now?" Cheat-Sheet Box */}
          <div className="bg-[#F0F9FA] border-l-4 border-[#135D66] p-6 rounded-r-2xl shadow-sm">
            <h4 className="flex items-center gap-2 text-[#135D66] font-bold text-lg mb-2">
              <FaWhatsapp className="text-[#25D366] text-xl" /> Prefer to talk now?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              For the fastest response, <a href="https://wa.me/255762992308" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold hover:underline">WhatsApp us</a> at <strong>+255 762 992 308</strong>. If you can, please include:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-1">
              <li>Month of travel</li>
              <li>Group size</li>
              <li>What you want (Kilimanjaro / Safari / Zanzibar)</li>
            </ul>
          </div>
          
          <div className="mt-12 hidden lg:block">
            <span className={`${caveat.className} text-4xl text-[#135D66]`}>Let's Talk About You!</span>
          </div>

        </div>

        {/* ========================================== */}
        {/* RIGHT SIDE: QUOTE FORM CONTAINER           */}
        {/* ========================================== */}
        <div className={`w-full lg:w-[55%] opacity-0 ${isVisible ? 'animate-fade-right-scroll' : ''}`}>
          
          <div className="bg-[#FFF9F0] rounded-[40px] p-8 md:p-12 shadow-xl border border-orange-50">
            
            <h3 className="text-3xl font-extrabold text-[#135D66] mb-2">
              Get a <span className="text-[#E59A1D]">Trip Quote</span>
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Share a few details and we’ll recommend the best sequence and routes for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: First & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" name="firstName" placeholder="First Name *" required
                  value={formData.firstName} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700"
                />
                <input 
                  type="text" name="lastName" placeholder="Last Name (Optional)"
                  value={formData.lastName} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700"
                />
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="email" name="email" placeholder="Email *" required
                  value={formData.email} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700"
                />
                <input 
                  type="tel" name="phone" placeholder="WhatsApp / Phone (Optional)"
                  value={formData.phone} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700"
                />
              </div>

              {/* Row 3: Month/Year & Trip Length */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  {/* Floating label fallback for Month input since placeholders behave weirdly on native date pickers */}
                  <span className="absolute -top-2 left-6 bg-[#FFF9F0] px-1 text-xs font-bold text-gray-500">
                    Month & Year of Travel *
                  </span>
                  <input 
                    type="month" name="monthYear" required
                    min={minMonth}
                    value={formData.monthYear} onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700 bg-white"
                  />
                </div>
                <input 
                  type="number" name="length" min="1" placeholder="Total Trip Length (days) *" required
                  value={formData.length} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700"
                />
              </div>

              {/* Row 4: Group Size & Inclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <select 
                  name="groupSize" required
                  value={formData.groupSize} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>Group Size *</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                  <option value="10+">10+</option>
                </select>

                <select 
                  name="include" required
                  value={formData.include} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>What do you want to include? *</option>
                  <option value="kilimanjaro">Kilimanjaro Only</option>
                  <option value="safari">Safari Only</option>
                  <option value="zanzibar">Zanzibar Only</option>
                  <option value="kili-safari">Kilimanjaro + Safari</option>
                  <option value="safari-zanzibar">Safari + Zanzibar</option>
                  <option value="all">Combined (Kili + Safari + Zanzibar)</option>
                </select>
              </div>

              {/* Row 5: Message */}
              <div>
                <textarea 
                  name="message" placeholder="Message (must-see experiences, constraints) *" rows={4} required
                  value={formData.message} onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-3xl border border-gray-200 focus:outline-none focus:border-[#E59A1D] focus:ring-1 focus:ring-[#E59A1D] transition-colors text-sm text-gray-700 resize-none"
                ></textarea>
              </div>

              {/* Real Google ReCaptcha */}
              <div className="mt-2">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google's public testing key. REPLACE THIS!
                  onChange={handleCaptchaChange}
                />
              </div>

              {/* --- PRIVACY LINE MOVED HERE --- */}
              <div className="w-full border-t border-gray-200 pt-6 mt-4 mb-2">
                <p className="text-gray-400 text-xs md:text-sm font-medium">
                  <span className="font-bold text-gray-500">Privacy:</span> By submitting the form above, you agree that we may contact you about your trip request. Your information is secure and will never be shared with third parties.
                </p>
              </div>

              {/* Submit Button (Disabled until form is valid or while submitting) */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`font-bold text-lg py-4 px-10 rounded-full transition-all shadow-lg w-full md:w-auto flex items-center justify-center gap-2
                    ${isFormValid && !isSubmitting
                      ? "bg-[#98D80D] hover:bg-[#86C00B] text-[#135D66] hover:-translate-y-1 shadow-[#98D80D]/20 cursor-pointer" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Request Trip Quote"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
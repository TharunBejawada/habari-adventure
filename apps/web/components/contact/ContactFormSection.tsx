// apps/web/components/contact/ContactFormSection.tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Caveat } from "next/font/google";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { apiFetch } from "../../lib/apiClient";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function ContactFormSection() {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW: State for the Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
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
      // Adapt the payload for the Universal Booking API
      const payload = {
        bookingType: "Contact", // Tag it explicitly
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        // monthYear: formData.monthYear,
        // length: formData.length,
        // groupSize: formData.groupSize,
        // Safely map the specific inclusion dropdown to the top of the message
        message: `[Interested in: ${formData.include}]\n\n${formData.message}`
      };

      const { ok } = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (ok) {
        // NEW: Show Success Modal instead of Alert
        setShowSuccessModal(true);
        
        // Clear the form on success
        setFormData({
          firstName: "", lastName: "", email: "", phone: "",
          monthYear: "", length: "", groupSize: "", include: "", message: ""
        });
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
        
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
    // formData.monthYear.trim() !== "" &&
    // formData.length.trim() !== "" &&
    // formData.groupSize.trim() !== "" &&
    // formData.include.trim() !== "" &&
    formData.message.trim() !== "" &&
    isCaptchaVerified;

  return (
    <section ref={sectionRef} className="headingCSS w-full py-20 lg:py-32 bg-white relative overflow-hidden z-10">
      
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
          @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-modal {
            animation: fadeInModal 0.3s ease-out forwards;
          }
        `
      }} />

      <div className="max-w-[1300px] mx-auto w-[96%] px-4 sm:px-6 flex flex-col lg:flex-row gap-16 lg:gap-12 items-start">
        
        {/* ========================================== */}
        {/* LEFT SIDE: CONTACT CARDS & CHEAT SHEET     */}
        {/* ========================================== */}
        <div className={`w-full lg:w-[45%] flex flex-col pt-4 opacity-0 ${isVisible ? 'animate-fade-left-scroll' : ''}`}>
          
          <h2 className="text-4xl font-extrabold text-[#135D66] mb-2">
            Contact Us <span className="text-[#fe6e00]">Detail</span>
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
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#D48A96] text-white flex items-center justify-center text-xl md:text-2xl shadow-md group-hover:scale-110 group-hover:bg-[#fe6e00] transition-all duration-300">
                <FaEnvelope />
              </div>
              <div>
                <span className="block text-gray-500 text-sm font-medium mb-1">Email</span>
                <span className="block text-[#135D66] font-extrabold text-lg md:text-xl break-all group-hover:text-[#fe6e00] transition-colors">habariadventure@gmail.com</span>
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
              For the fastest response, <a href="https://wa.me/255762992308" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold hover:underline">WhatsApp</a> us at <strong>+255 762 992 308</strong>. If you can, please include:
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
          
          <div className="bg-[#135D66] rounded-[40px] p-8 md:p-12 shadow-xl border border-orange-50">
            
            <h3 className="text-3xl font-extrabold text-gray-200 mb-2">
              Get a <span className="text-[#fe6e00]">Trip Quote</span>
            </h3>
            <p className="text-gray-200 text-sm mb-8">
              Share a few details and we’ll recommend the best sequence and routes for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: First & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" name="firstName" placeholder="First Name *" required
                  value={formData.firstName} onChange={handleInputChange}
                  className="descCSS bg-[#F0F9FA] w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-base text-gray-700"
                />
                <input 
                  type="text" name="lastName" placeholder="Last Name (Optional)"
                  value={formData.lastName} onChange={handleInputChange}
                  className="descCSS bg-[#F0F9FA] w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-base text-gray-700"
                />
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="email" name="email" placeholder="Email *" required
                  value={formData.email} onChange={handleInputChange}
                  className="descCSS bg-[#F0F9FA] w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-base text-gray-700"
                />
                <input 
                  type="tel" name="phone" placeholder="WhatsApp / Phone (Optional)"
                  value={formData.phone} onChange={handleInputChange}
                  onKeyDown={(e) => {
                    // Allow navigation/control keys, plus numbers and standard phone symbols (+ - ( ) space)
                    if (!/^[0-9+\-() ]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="descCSS bg-[#F0F9FA] w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-base text-gray-700"
                />
              </div>

              {/* Row 3: Month/Year & Trip Length */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  
                  <span className="absolute -top-2 left-6 bg-[#FFF9F0] px-1 text-xs font-bold text-gray-500">
                    Month & Year of Travel *
                  </span>
                  <input 
                    type="month" name="monthYear" required
                    min={minMonth}
                    value={formData.monthYear} onChange={handleInputChange}
                    onKeyDown={(e) => {
                      
                      if (!/^[0-9\-]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-sm text-gray-700 bg-white"
                  />
                </div>
                <input 
                  type="number" name="length" min="1" placeholder="Total Trip Length (days) *" required
                  value={formData.length} onChange={handleInputChange}
                  onKeyDown={(e) => {
                   
                    if (!/^[0-9]$/.test(e.key) && !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="bg-white w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-sm text-gray-700"
                />
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <select 
                  name="groupSize" required
                  value={formData.groupSize} onChange={handleInputChange}
                  className="bg-white w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-sm text-gray-500 appearance-none bg-white cursor-pointer"
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
                  className="bg-white w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-sm text-gray-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>What do you want to include? *</option>
                  <option value="kilimanjaro">Kilimanjaro Only</option>
                  <option value="safari">Safari Only</option>
                  <option value="zanzibar">Zanzibar Only</option>
                  <option value="kili-safari">Kilimanjaro + Safari</option>
                  <option value="safari-zanzibar">Safari + Zanzibar</option>
                  <option value="all">Combined (Kili + Safari + Zanzibar)</option>
                </select>
              </div> */}

              {/* Row 5: Message */}
              <div>
                <textarea 
                  name="message" placeholder="Message (must-see experiences, constraints) *" rows={4} required
                  value={formData.message} onChange={handleInputChange}
                  className="descCSS bg-[#F0F9FA] w-full px-6 py-4 rounded-3xl border border-gray-200 focus:outline-none focus:border-[#fe6e00] focus:ring-1 focus:ring-[#fe6e00] transition-colors text-base text-gray-700 resize-none"
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
                <p className="text-gray-200 text-xs md:text-sm font-medium">
                  <span className="font-bold text-gray-100">Privacy:</span> By submitting the form above, you agree that we may contact you about your trip request. Your information is secure and will never be shared with third parties.
                </p>
              </div>

              {/* Submit Button (Disabled until form is valid or while submitting) */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`font-bold text-lg py-4 px-10 rounded-full transition-all shadow-lg w-full md:w-auto flex items-center justify-center gap-2
                    ${isFormValid && !isSubmitting
                      ? "bg-[#fe6e00] hover:bg-[#fe6e00]/70 text-white hover:-translate-y-1 shadow-[#fe6e00]/20 cursor-pointer" 
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

      {/* NEW: SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowSuccessModal(false)}
          ></div>
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in-modal flex flex-col p-6">
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
              <p className="text-gray-600">Our team will get back to you shortly.</p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
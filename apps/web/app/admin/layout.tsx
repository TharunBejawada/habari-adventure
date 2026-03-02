// apps/web/app/admin/layout.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Admin Dashboard | Habari Adventure",
//   description: "Secure administrative dashboard for managing Habari Adventure packages, itineraries, and bookings.",
//   keywords: ["Habari Adventure", "Admin Dashboard", "Travel Dashboard", "Tour Management", "Secure Portal"],
// };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Dynamic User Data States
  const [userEmail, setUserEmail] = useState("Loading...");
  const [userRole, setUserRole] = useState("Admin");
  const [userFirstName, setUserFirstName] = useState("Super");
  const [userLastName, setUserLastName] = useState("Admin");
  

  const profileRef = useRef<HTMLDivElement>(null);

  // Authentication & Dynamic Data Initialization
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    
    // Grab the stored user data from login
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email) setUserEmail(parsedUser.email);
        if (parsedUser.role) setUserRole(parsedUser.role);
        if (parsedUser.firstName) setUserFirstName(parsedUser.firstName);
        if (parsedUser.lastName) setUserLastName(parsedUser.lastName);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    } else {
      setUserEmail("admin@habariadventure.com"); // Fallback
    }

    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser"); // Clear data on logout
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Packages", href: "/admin/packages", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { name: "Itineraries", href: "/admin/itineraries", icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" },
    { name: "Blog Posts", href: "/admin/blogs", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { name: "Bookings", href: "/admin/bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "User Management", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  ];

  const getHeaderTitle = () => {
    if (!pathname || pathname === "/admin") return "Dashboard Overview";
    
    const pathParts = pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    
    // Strict TypeScript safety check
    if (!lastPart) return "Dashboard Overview";

    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace("-", " ");
  };

  // Get first letter of email for the avatar
  const userInitials = userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-200">
      
      {/* --- 100% WIDTH TOP HEADER --- */}
      <header className="h-16 w-full flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 shadow-sm z-20 transition-colors duration-200">
        
        {/* Left Side: Hamburger, Logo, and Title (Static layout, never jumps) */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Image 
            src="/logo.png" 
            alt="Habari Logo" 
            width={120} 
            height={40} 
            className="object-contain h-8 w-auto hidden sm:block drop-shadow-sm" 
          />
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
          
          <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
            {getHeaderTitle()}
          </h1>
        </div>
          
        {/* Right Side: Profile Dropdown */}
        <div className="flex items-center">
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-adventure-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white dark:ring-gray-800">
                {userInitials}
              </div>
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 origin-top-right z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{userFirstName} {userLastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                </div>
                {/* <Link href="/admin/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  My Profile
                </Link>
                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Account Settings
                </Link>
                <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div> */}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Secure Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- BOTTOM SECTION (Sidebar + Page Content) --- */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* Collapsible Sidebar */}
        <aside 
          className={`${isSidebarOpen ? "w-64" : "w-20"} flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 z-10`}
        >
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} title={!isSidebarOpen ? item.name : ""}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-adventure-50 dark:bg-adventure-900/30 text-adventure-600 dark:text-adventure-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } ${!isSidebarOpen ? "justify-center" : ""}`}
                >
                  <svg className={`flex-shrink-0 h-6 w-6 ${isActive ? "text-adventure-600 dark:text-adventure-400" : "text-gray-400 dark:text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  
                  <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "ml-3 opacity-100 w-auto" : "ml-0 opacity-0 w-0 overflow-hidden"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page Content Area */}
        <main className="flex-1 relative overflow-y-auto bg-gray-50 dark:bg-gray-900 focus:outline-none transition-colors duration-200">
          <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}
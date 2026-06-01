// apps/web/app/admin/page.tsx
import Link from "next/link";

const navigationItems = [
  // { 
  //   name: "Dashboard", 
  //   href: "/admin", 
  //   icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  //   color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
  // },
  { 
    name: "Locations", 
    href: "/admin/locations", 
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
  },
  { 
    name: "Packages", 
    href: "/admin/packages", 
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
  },
  { 
    name: "Pricing Matrix", 
    href: "/admin/pricing", 
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
  },
  { 
    name: "Upcoming Dates", 
    href: "/admin/upcoming-dates", 
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
  },  
  { 
    name: "Blog Posts", 
    href: "/admin/blogs", 
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
  },
  { 
    name: "Bookings", 
    href: "/admin/bookings", 
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
  },
  { name: "Stats", 
    href: "/admin/stats", 
    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
  },
  { 
    name: "Gallery", 
    href: "/admin/gallery", 
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
  },  
  { 
    name: "Site Settings", 
    href: "/admin/settings", 
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400"
  },
  { 
    name: "Crew Settings", 
    href: "/admin/crew", 
    icon: "M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400"
  },
  { 
    name: "Email Settings", 
    href: "/admin/settings/email", 
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
  },
  { 
    name: "User Management", 
    href: "/admin/users", 
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
  },
];

export default function AdminDashboard() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to the Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select a module below to manage your system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {navigationItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
          >
            <div className={`p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
              <svg 
                className="w-8 h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={item.icon} 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {item.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
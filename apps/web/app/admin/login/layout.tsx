// apps/web/app/admin/login/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Habari Adventure",
  description: "Secure administrative dashboard for managing Habari Adventure packages, itineraries, and bookings.",
  keywords: ["Habari Adventure", "Admin Login", "Travel Dashboard", "Tour Management", "Secure Portal"],
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
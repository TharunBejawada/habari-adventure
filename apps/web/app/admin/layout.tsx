// apps/web/app/admin/layout.tsx
import { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

// 1. THIS IS THE MAGIC BULLET! 
// Because this is a Server Component, Next.js will successfully inject this 
// into the <head> of the document, completely locking out Google Translate.
export const metadata: Metadata = {
  title: "Admin Dashboard | Habari Adventure",
  other: {
    google: "notranslate",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 2. We pass the children into your interactive Client Component
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
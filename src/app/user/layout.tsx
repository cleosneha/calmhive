import { ReactNode } from "react";
import Sidebar from "@/components/shared/sidebar/sidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main
        className="transition-all duration-200 flex-1 px-6 py-8"
        style={{ marginLeft: "var(--sidebar-width, 4rem)" }}
      >
        {children}
      </main>
    </div>
  );
}

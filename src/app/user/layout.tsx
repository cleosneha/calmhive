import { ReactNode } from "react";
import Sidebar from "@/components/shared/sidebar/sidebar";
import HamburgerHeader from "@/components/shared/hamburger-header/hamburger-header";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar - hidden on small screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header - only on small screens */}
      <div className="block md:hidden">
        <HamburgerHeader />
      </div>

      {/* Main Content */}
      <main className="transition-all duration-200 md:ml-20 md:px-6 md:py-8 px-4 py-4 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

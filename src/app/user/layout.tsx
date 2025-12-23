import { ReactNode } from "react";
import { HeaderLoggedIn } from "@/components/shared/header/header-logged-in-client";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderLoggedIn />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

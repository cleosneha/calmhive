import { ReactNode } from "react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">CalmHive</h1>
          <div className="flex gap-4">
            <a href="/journal" className="text-slate-600 hover:text-slate-900">
              Journal
            </a>
            <a href="/plan" className="text-slate-600 hover:text-slate-900">
              Plans
            </a>
            <a href="/insights" className="text-slate-600 hover:text-slate-900">
              Insights
            </a>
            <a href="/settings" className="text-slate-600 hover:text-slate-900">
              Settings
            </a>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
}

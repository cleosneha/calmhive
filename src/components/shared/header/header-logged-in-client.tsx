"use client";

import { useSession, useSignOut } from "@/hooks/useSession";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdLogout, MdSettings } from "react-icons/md";

export function HeaderLoggedIn() {
  const { data: session, isPending } = useSession();
  const { signOut } = useSignOut();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-slate-900">
            CalmHive
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              href="/journal"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Journal
            </Link>
            <Link
              href="/plan"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Plans
            </Link>
            <Link
              href="/insights"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Insights
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {!isPending && session?.user && (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                  <Link
                    href="/settings"
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title="Settings"
                  >
                    <MdSettings className="text-xl text-slate-600" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-slate-100 rounded-lg transition text-red-600"
                    title="Sign out"
                  >
                    <MdLogout className="text-xl" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

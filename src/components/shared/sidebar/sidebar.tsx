"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MdLogout } from "react-icons/md";
import { useSignOut } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/user", icon: <FiHome />, label: "Home" },
  { href: "/journal", icon: <FiBook />, label: "Journal" },
  { href: "/plan", icon: <FiCalendar />, label: "Plan" },
  { href: "/insights", icon: <FiBarChart2 />, label: "Insights" },
  { href: "/settings", icon: <FiSettings />, label: "Settings" },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const { data } = useSession();
  const user = data?.user;
  const initials = getInitials(user?.name || user?.email);
  const pathname = usePathname();
  const { signOut } = useSignOut();

  return (
    <aside
      className="sidebar fixed top-0 left-0 h-screen min-h-screen z-40 flex flex-col items-center bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] shadow w-20 py-4"
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center h-20 w-full border-b border-[var(--sidebar-border)] mb-2">
        <Image
          src="/calmhive.png"
          alt="CalmHive Logo"
          width={40}
          height={40}
          className="transition-all duration-200"
          priority
        />
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 mt-4 w-full items-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-14 mx-auto rounded-xl transition-all duration-150
                ${
                  isActive
                    ? "bg-[var(--ch-sage-dark)]/10 border border-[var(--ch-sage-dark)] shadow-sm"
                    : "hover:bg-[var(--ch-sage-dark)]/5 border border-transparent"
                }
              `}
            >
              <span
                className={`text-2xl ${
                  isActive
                    ? "text-[var(--ch-sage-dark)]"
                    : "text-[var(--sidebar-foreground)]"
                }`}
              >
                {link.icon}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-[var(--ch-sage-dark)]"
                    : "text-[var(--sidebar-foreground)]"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {/* User Initials at Bottom */}
      <div className="mb-2 mt-auto flex flex-col items-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="sidebar-user-initials bg-[var(--ch-sage-dark)] text-white w-10 h-10 flex items-center justify-center rounded-full text-base font-bold mb-1 mx-auto select-none focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)]"
              aria-label="User menu"
            >
              {initials}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="mb-2 ml-2"
          >
            <DropdownMenuItem
              onClick={signOut}
              className="text-[var(--destructive)] focus:bg-[var(--destructive)]/10"
            >
              <span className="flex items-center gap-2">
                <MdLogout className="text-lg" /> Logout
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

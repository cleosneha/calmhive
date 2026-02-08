"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import {
  FiBook,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiMenu,
} from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/user/journal", icon: <FiBook />, label: "Journal" },
  { href: "/user/plan", icon: <FiCalendar />, label: "Plan" },
  { href: "/user/insights", icon: <FiBarChart2 />, label: "Insights" },
  { href: "/user/settings", icon: <FiSettings />, label: "Settings" },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function HamburgerHeader() {
  const { data } = useSession();
  const user = data?.user;
  const initials = getInitials(user?.name || user?.email);
  const pathname = usePathname();
  const { signOut } = useSignOut();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[var(--sidebar-border)] p-4 flex items-center justify-between md:hidden">
        <Link href="/">
          <Image
            src="/calmhive.png"
            alt="CalmHive Logo"
            width={32}
            height={32}
            className="transition-all duration-200"
            priority
          />
        </Link>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--ch-sage-dark)]"
            >
              <FiMenu className="text-2xl" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white w-64 p-0">
            {/* Visually hidden title for accessibility (Radix DialogTitle requirement) */}
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              {/* Header with user initials menu inside sheet */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-border)]">
                <Link href="/">
                  <Image
                    src="/calmhive.png"
                    alt="CalmHive Logo"
                    width={32}
                    height={32}
                    priority
                  />
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex flex-col gap-2 p-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-[var(--ch-sage-dark)]/10 border border-[var(--ch-sage-dark)] text-[var(--ch-sage-dark)]"
                          : "hover:bg-[var(--ch-sage-dark)]/5 text-[var(--foreground)]"
                      }`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
                {/* User Initials at Bottom Center */}
                <div className="flex justify-center items-center p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-[var(--ch-sage-dark)] text-white w-10 h-10 flex items-center justify-center rounded-full text-base font-bold select-none focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-dark)]"
                        aria-label="User menu"
                      >
                        {initials}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8}>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-[var(--foreground)] hover:bg-[var(--ch-sage-light)] focus:bg-[var(--ch-sage-light)]"
                      >
                        <span className="flex items-center gap-2">
                          <MdLogout className="text-lg" /> Logout
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

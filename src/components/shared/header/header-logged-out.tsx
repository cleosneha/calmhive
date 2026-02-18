"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiMenu } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/guide", label: "Guide" },
  { href: "/contact", label: "Contact" },
];

export default function HeaderLoggedOut() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header
      className={`w-full px-4 py-3 relative z-20 ${isLandingPage ? "bg-transparent" : "bg-white border-b border-gray-200"}`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`text-2xl font-bold tracking-tight select-none transition hover:drop-shadow-2xl ${
              isLandingPage
                ? "text-white drop-shadow-lg hover:text-white/80"
                : "text-[var(--ch-sage-dark)] hover:text-[var(--ch-sage-dark)]/80"
            }`}
          >
            Calmhive
          </Link>
        </div>

        {/* Center: Navigation - Hidden on mobile */}
        <ul className="hidden md:flex gap-8 items-center justify-center flex-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition ${
                  isLandingPage
                    ? "nav-link text-[var(--ch-sage-dark)] drop-shadow-md hover:text-[var(--ch-sage-dark)]/80"
                    : "text-gray-700 hover:text-[var(--ch-sage-dark)] font-medium relative after:absolute after:left-0 after:right-0 after:bottom-[-8px] after:h-[2px] after:bg-[var(--ch-sage-dark)] after:opacity-0 after:scale-x-0 after:transition-all after:duration-200 after:rounded-sm hover:after:opacity-100 hover:after:scale-x-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={
                  isLandingPage
                    ? "text-white hover:bg-white/10"
                    : "text-[var(--foreground)] hover:bg-gray-100"
                }
              >
                <FiMenu className="text-2xl" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white w-64 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Header with logo */}
                <div className="flex items-center p-4 border-b border-gray-200">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Image
                      src="/calmhive.png"
                      alt="CalmHive Logo"
                      width={32}
                      height={32}
                      priority
                    />
                  </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 flex flex-col gap-2 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-all hover:bg-[var(--ch-sage-dark)]/5 text-[var(--foreground)]"
                    >
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Get Started Button at Bottom */}
                <div className="p-4 border-t border-gray-200">
                  <Button
                    asChild
                    className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-light)] text-white font-semibold py-3 rounded-2xl"
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      GET STARTED
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right: Get Started Button - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            asChild
            variant="white"
            className={`font-semibold px-4 py-2 rounded-2xl transition-shadow ${
              isLandingPage
                ? "bg-[var(--ch-sage-dark)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] hover:shadow-[inset_0_3px_10px_rgba(0,0,0,0.22)] hover:bg-[var(--ch-sage-light)] text-white"
                : "bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-light)] text-white shadow-sm"
            }`}
          >
            <Link href="/login">GET STARTED</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

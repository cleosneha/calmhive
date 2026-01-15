import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeaderLoggedOut() {
  return (
    <header className="w-full px-4 py-3 bg-transparent relative z-20  ">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold text-white drop-shadow-lg tracking-tight select-none"
          >
            CalmHive
          </Link>
        </div>

        {/* Center: Navigation */}
        <ul className="hidden md:flex gap-8 items-center justify-center flex-1">
          <li>
            <Link
              href="/"
              className="nav-link text-white drop-shadow-md hover:text-white/80 transition"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="#purpose"
              className="nav-link text-white drop-shadow-md hover:text-white/80 transition"
            >
              Purpose
            </Link>
          </li>
          <li>
            <Link
              href="#guide"
              className="nav-link text-white drop-shadow-md hover:text-white/80 transition"
            >
              Guide
            </Link>
          </li>
          <li>
            <Link
              href="#pricing"
              className="nav-link text-white drop-shadow-md hover:text-white/80 transition"
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="nav-link text-white drop-shadow-md hover:text-white/80 transition"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Right: Get Started Button */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="white"
            className="bg-[var(--ch-sage-light)]/70 hover:bg-[var(--ch-sage-dark)] shadow-lg hover:shadow-xl"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

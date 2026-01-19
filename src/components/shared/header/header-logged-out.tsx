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
            className="text-2xl font-bold text-white drop-shadow-lg tracking-tight select-none hover:text-white/80 transition hover:drop-shadow-2xl"
          >
            Calmhive
          </Link>
        </div>

        {/* Center: Navigation */}
        <ul className="hidden md:flex gap-8 items-center justify-center flex-1">
          {(
            [
              { href: "/", label: "Home" },
              { href: "#purpose", label: "Purpose" },
              { href: "#guide", label: "Guide" },
              { href: "#pricing", label: "Pricing" },
              { href: "#contact", label: "Contact" },
            ] as const
          ).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-link text-[var(--ch-sage-dark)] drop-shadow-md hover:text-[var(--ch-sage-dark)]/80 transition"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Get Started Button */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="white"
            className="bg-[var(--ch-sage-dark)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] hover:shadow-[inset_0_3px_10px_rgba(0,0,0,0.22)] hover:bg-[var(--ch-sage-light)] transition-shadow rounded-2xl text-white font-semibold px-4 py-2"
          >
            <Link href="/login">GET STARTED</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

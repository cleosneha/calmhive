import Link from "next/link";

export default function HeaderLoggedOut() {
  return (
    <header className="w-full px-4 py-3 bg-[var(--ch-offwhite)] border-b border-[var(--ch-sage-dark)]/10 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold text-[var(--ch-sage-dark)] tracking-tight select-none"
          >
            CalmHive
          </Link>
        </div>

        {/* Center: Navigation */}
        <ul className="hidden md:flex gap-8 items-center justify-center flex-1">
          <li>
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link href="#purpose" className="nav-link">
              Purpose
            </Link>
          </li>
          <li>
            <Link href="#guide" className="nav-link">
              Guide
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="nav-link">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="#contact" className="nav-link">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right: Get Started Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-light)] text-white px-6 py-2 font-semibold text-base transition-colors shadow focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-light)]"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}

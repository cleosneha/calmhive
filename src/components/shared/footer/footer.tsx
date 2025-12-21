import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full px-4 py-6 bg-[var(--ch-offwhite)] border-t border-[var(--ch-sage-light)]/20 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--ch-sage-dark)] tracking-tight select-none"
          >
            CalmHive
          </Link>
        </div>

        {/* Right: Copyright */}
        <p className="text-sm text-[var(--ch-text)]">
          © 2025 CalmHive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

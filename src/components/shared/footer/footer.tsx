import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaMapMarkerAlt,
  FaMailBulk,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/celersneha", label: "GitHub", icon: FaGithub },
  { href: "https://x.com/celersneha", label: "X", icon: SiX },
  {
    href: "https://linkedin.com/in/celersneha",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export default function Footer() {
  return (
    <footer className="w-full mt-6 text-sm  relative overflow-hidden">
      {/* Decorative Gradient Background (centered semicircular gradient from bottom) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-44 rounded-t-full bg-gradient-to-t from-[var(--ch-sage-dark)]/25 to-white/0 opacity-60 blur-3xl pointer-events-none" />
      </div>

      <div className=" border-t border-[var(--ch-sage-light)]/40">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-700">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <Image
                  src="/calmhive.png"
                  alt="CalmHive"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-[var(--ch-sage-light)]">
                CalmHive
              </span>
            </Link>
            <p className="text-[13px] text-gray-700 max-w-sm">
              CalmHive is a mindful productivity app that helps you plan,
              reflect, and build gentle habits for consistent progress.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[var(--ch-sage-light)] font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-700">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--ch-sage-light)] font-semibold mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-4 h-4 text-[var(--ch-sage-light)]" />
                <span>India</span>
              </li>
              <li>
                <a
                  href="mailto:celersneha@gmail.com"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:underline"
                  aria-label="Email CalmHive"
                >
                  <FaMailBulk className="w-4 h-4 text-[var(--ch-sage-light)]" />
                  <span>celersneha@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-[var(--ch-sage-light)] font-semibold mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-4 text-gray-700">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="hover:text-gray-900"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--ch-sage-light)]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-gray-800 text-sm">
          <div>© 2026 CalmHive. All rights reserved.</div>
          <div className="flex items-center gap-6 mt-3 md:mt-0">
            <Link href="/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

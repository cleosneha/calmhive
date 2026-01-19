"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DecodeText from "@/components/shared/decode-text";

export default function CTA() {
  return (
    <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl">
      {/* Background Image */}
      <Image
        src="/assets/landing-page/CTA.png"
        alt="CTA Background"
        width={1200}
        height={400}
        className="absolute inset-0 h-full max-w-6xl object-cover"
        priority
      />

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 sm:px-8 sm:py-24 md:py-28">
        <h2 className="mb-8 text-center text-2xl font-bold text-black sm:text-3xl md:text-3xl">
          Ready to transform your productivity?
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/login">
            <Button className="bg-white text-[var(--ch-sage-dark)] hover:bg-white/90 ">
              <DecodeText text="GET STARTED" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

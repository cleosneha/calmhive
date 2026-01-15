"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden bg-white -mt-[76px] pt-[76px]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/landing-page/hero-section-2.png"
          alt="CalmHive Meditation Background"
          fill
          className="object-cover object-center"
          priority
          quality={50}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 "></div>
        {/* Bottom fade to blend into page */}
        <div className="absolute bottom-0 left-0 w-full h-48 md:h-72 pointer-events-none bg-gradient-to-b from-transparent to-[rgba(255,255,255)]" />
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center gap-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg mb-4 leading-tight whitespace-pre-line">
            <span>
              Slow down
              <br />
              and let
              <br />
              clarity settle in
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white drop-shadow-md mb-8 font-light">
            A quiet space for your mind.
          </p>

          <Button asChild variant="lowOpacityWhite">
            <Link href="/register">Start your Journey</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

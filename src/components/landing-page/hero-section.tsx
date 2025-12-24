"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-center gap-10 py-16 px-4 bg-[var(--ch-offwhite)] min-h-screen">
      {/* Left: Image (only if loaded) */}
      {imageLoaded && (
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="/assets/hero-calmhive.png"
            alt="CalmHive Mindful Planning"
            width={420}
            height={420}
            className="rounded-3xl shadow-xl object-cover max-w-xs md:max-w-sm lg:max-w-md border border-[var(--ch-sage-dark)]/10 bg-white/40"
            priority
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
        </div>
      )}

      {/* Right: Text & CTA */}
      <div
        className={`w-full ${imageLoaded ? "md:w-1/2" : ""} flex flex-col ${
          imageLoaded ? "items-start" : "items-center text-center"
        } gap-6`}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--ch-sage-dark)] leading-tight drop-shadow-sm">
          Find Calm.{" "}
          <span className="text-[var(--ch-bluegrey)]">Plan Mindfully.</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--ch-text)] max-w-lg">
          CalmHive is your gentle, AI-powered space for planning, journaling,
          and reflection. No pressure, no judgment—just calm progress at your
          pace.
        </p>
        <Button
          asChild
          className="mt-2 rounded-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-light)] text-white  px-8 py-3 font-semibold text-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage-light)]"
        >
          <Link href="/onboarding">Get Started</Link>
        </Button>
      </div>

      {/* Hidden Image to check load */}
      {!imageLoaded && (
        <Image
          src="/assets/hero-calmhive.png"
          alt=""
          width={1}
          height={1}
          className="hidden"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
      )}
    </section>
  );
}

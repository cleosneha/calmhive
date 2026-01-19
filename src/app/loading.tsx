"use client";

import Image from "next/image";
import { useState } from "react";

const FACTS: string[] = [
  "Deep breathing can reduce heart rate within minutes.",
  "Short, consistent habits beat occasional long sessions.",
  "A 5-minute break can improve focus and productivity.",
  "Nature sounds can lower stress and promote calm.",
  "Writing for 3 minutes helps clarify your thoughts.",
  "Small wins compound into lasting change over time.",
  "Stretching improves circulation and reduces tension.",
  "A consistent sleep schedule strengthens mood stability.",
  "Gratitude journaling can boost wellbeing in weeks.",
  "Hydration affects energy and cognitive performance.",
  "Fresh air and light exposure help regulate circadian rhythm.",
  "Mindful pauses during the day reduce reactivity.",
  "A calm workspace can improve concentration and reduce stress.",
  "Short walks increase creativity and mental clarity.",
];

export default function Loading() {
  // Use first fact for consistent rendering
  const factIndex = 0;

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <div
        className="w-full max-w-md  backdrop-blur-sm rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <Image
              src="/calmhive.png"
              alt="CalmHive Logo"
              fill
              sizes="80px"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <h2 className="text-lg font-semibold text-[var(--ch-sage-dark)]">
            Setting things up
          </h2>

          <p
            className={`text-sm text-[var(--foreground)]/70 text-center max-w-xs transition-opacity duration-700  "opacity-100" 
            `}
          >
            {FACTS[factIndex]}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1" aria-hidden>
          <span
            className="w-2 h-2 rounded-full bg-[var(--ch-sage-dark)] animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--ch-sage-dark)] animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[var(--ch-sage-dark)] animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        <p className="text-xs text-[var(--foreground)]/60 mt-1">
          This may take a few seconds
        </p>

        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

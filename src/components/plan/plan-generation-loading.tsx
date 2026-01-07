"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const GENERATION_STEPS = [
  "Processing your onboarding responses",
  "Analyzing your personality and preferences",
  "Assessing your time and goals",
  "Evaluating your available resources",
  "Creating personalized activities",
  "Optimizing your weekly schedule",
  "Finalizing your wellness plan",
];

export default function PlanGenerationLoading() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Don't go to 100 until done
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="w-full max-w-md backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6"
        role="status"
        aria-live="polite"
        aria-label="Generating your personalized plan"
      >
        {/* Logo */}
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

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--ch-sage-dark)] mb-2">
            Creating Your Plan
          </h2>
          <p className="text-sm text-[var(--foreground)]/70">
            Personalizing your wellness journey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="h-2 bg-[var(--ch-sage-light)]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--ch-sage-dark)] to-[var(--ch-sage-dark)]/70 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 90)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--foreground)]/60 text-center">
            {Math.min(Math.floor(progress), 90)}%
          </p>
        </div>

        {/* Current Step */}
        <div className="w-full">
          <div className="min-h-[60px] flex items-center justify-center">
            <p className="text-center text-sm font-medium text-[var(--ch-sage-dark)] animate-fade-in-out">
              {GENERATION_STEPS[currentStep]}
            </p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-1">
          {GENERATION_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? "w-4 bg-[var(--ch-sage-dark)]"
                  : "w-1.5 bg-[var(--ch-sage-dark)]/30"
              }`}
            />
          ))}
        </div>

        {/* Pulse Animation Dots */}
        <div className="flex items-center gap-2 mt-2" aria-hidden>
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

        <p className="text-xs text-[var(--foreground)]/60 mt-2">
          This may take a minute
        </p>

        <span className="sr-only">
          Generating your personalized wellness plan
        </span>
      </div>

      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-fade-in-out {
          animation: fadeInOut 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

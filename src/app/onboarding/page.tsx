"use client";

import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";

export default function OnboardingPage() {
  const { data } = useSession();
  const userName = data?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-lg xl:max-w-xl 2xl:max-w-2xl text-center">
        {/* Logo at top */}
        <div className="flex justify-center mb-6">
          <Image
            src="/calmhive.png"
            alt="CalmHive Logo"
            width={64}
            height={64}
            className="mx-auto drop-shadow-sm"
            priority
          />
        </div>
        {/* Greeting */}
        <div className="mb-8 xl:mb-10 2xl:mb-12">
          <h1 className="text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-[var(--ch-sage-dark)] mb-2 xl:mb-3 2xl:mb-4">
            Hey {userName}!{" "}
          </h1>
          <p className="text-base md:text-lg xl:text-xl 2xl:text-2xl text-[var(--foreground)]/70">
            Let&apos;s get to know you better
          </p>
        </div>

        {/* Description */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-6 md:p-8 xl:p-10 2xl:p-12 mb-8 xl:mb-10 2xl:mb-12 border border-[var(--ch-sage-dark)]/10 shadow-sm">
          <p className="text-[var(--foreground)] mb-4 xl:mb-5 2xl:mb-6 leading-relaxed text-sm md:text-base xl:text-lg 2xl:text-xl">
            In the next few minutes, we&apos;ll learn about your goals, habits,
            and preferences to create a personalized wellness plan just for you.
          </p>
          <p className="text-xs md:text-sm xl:text-base 2xl:text-lg text-[var(--foreground)]/60">
            No pressure—you&apos;re in control every step of the way.
          </p>
        </div>

        {/* CTA Button */}
        <Link href="/onboarding/chat" className="w-full">
          <Button
            size="lg"
            className="w-full bg-[var(--ch-sage-dark)] hover:bg}-[var(--ch-sage-dark)]/90 text-white font-semibold rounded-xl transition-all duration-200 group text-base md:text-lg xl:text-xl 2xl:text-2xl py-3 md:py-4 xl:py-5 2xl:py-6"
          >
            <span>Start the Journey</span>
            <FiArrowRight className="ml-2 g text-lg md:text-xl xl:text-2xl 2xl:text-3xl" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

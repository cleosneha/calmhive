"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generatePlan } from "@/actions/plan/plan";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import PlanGenerationLoading from "@/components/plan/plan-generation-loading";

export default function NoPlanUI() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);

      // Generate the plan
      const generateResult = await generatePlan();

      if (generateResult.status === "error") {
        toast.error(generateResult.error || "Failed to generate plan");
        setIsGenerating(false);
        return;
      }

      // Success! Reload or redirect to show the generated plan
      toast.success("Your personalized plan is ready!");
      router.refresh();
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  // Show plan generation loading screen
  if (isGenerating) {
    return <PlanGenerationLoading />;
  }

  return (
    <div className="min-h-screen  p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Logo */}
          <div className="relative w-16 h-16">
            <Image
              src="/calmhive.png"
              alt="CalmHive Logo"
              fill
              sizes="64px"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--ch-sage-dark)] mb-2">
              No Plan Yet
            </h1>
            <p className="text-[var(--foreground)]/70">
              Let&apos;s create your personalized wellness plan based on your
              onboarding responses.
            </p>
          </div>

          {/* Features */}
          <div className="w-full space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[var(--ch-sage-dark)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--ch-sage-dark)]">
                  ✓
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)]/80">
                Personalized schedule based on your goals
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[var(--ch-sage-dark)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--ch-sage-dark)]">
                  ✓
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)]/80">
                Optimized for your available time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[var(--ch-sage-dark)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-[var(--ch-sage-dark)]">
                  ✓
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)]/80">
                Respects your rest days and preferences
              </p>
            </div>
          </div>

          {/* Button */}
          <Button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full bg-[var(--ch-sage-dark)] text-white hover:bg-[var(--ch-sage-dark)]/90 transition py-6 text-base font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Create My Plan"
            )}
          </Button>

          <p className="text-xs text-[var(--foreground)]/60">
            This will use your onboarding responses to generate a tailored plan
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/actions/onboarding/onboarding";
import { toast } from "sonner";

export default function TermsActions() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!accepted) return;

    setLoading(true);
    try {
      const result = await completeOnboarding();

      if (!result.success) {
        toast.error("Failed to complete onboarding. Please try again.");
        setLoading(false);
        return;
      }

      // Small delay to ensure session is updated before redirect
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Replace history instead of pushing to prevent back button issues
      router.replace("/onboarding/complete");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="accept-terms"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="w-5 h-5 rounded border-[var(--ch-sage-dark)] text-[var(--ch-sage-dark)] focus:ring-[var(--ch-sage-dark)]"
        />
        <label
          htmlFor="accept-terms"
          className="text-sm md:text-base text-gray-700 cursor-pointer"
        >
          I have read and agree to the Terms & Conditions
        </label>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!accepted || loading}
        className="w-full bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Continue"}
      </Button>
    </div>
  );
}

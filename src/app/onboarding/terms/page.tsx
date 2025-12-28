"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/actions/onboarding";

export default function TermsAndConditionsPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!accepted) return;

    setLoading(true);
    try {
      const result = await completeOnboarding();

      if (!result.success) {
        alert("Failed to complete onboarding. Please try again.");
        setLoading(false);
        return;
      }

      // Small delay to ensure session is updated before redirect
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to complete page
      router.push("/onboarding/complete");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--ch-sage-dark)] mb-6">
          Terms & Conditions
        </h1>

        <div className="prose max-w-none mb-8 h-96 overflow-y-auto bg-white/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By using CalmHive, you agree to these Terms & Conditions. CalmHive
            is designed to support gentle daily habits and relaxation, not to
            diagnose, treat, or prevent any medical or mental health condition.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
          <p className="mb-4">
            CalmHive provides AI-powered personalized wellness plans, journal
            analysis, and weekly insights to help you build better daily habits,
            reduce stress, and improve your overall well-being.
          </p>

          <h2 className="text-xl font-semibold mb-4">3. Not Medical Advice</h2>
          <p className="mb-4">
            CalmHive is NOT a substitute for professional medical or mental
            health advice, diagnosis, or treatment. If you are experiencing
            severe mental health issues, physical health problems, or a medical
            emergency, please consult a qualified healthcare provider
            immediately.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. User Responsibility</h2>
          <p className="mb-4">
            You are responsible for your own well-being and any actions you take
            based on CalmHive&apos;s suggestions. Always use your judgment and
            seek professional help when needed.
          </p>

          <h2 className="text-xl font-semibold mb-4">5. Privacy</h2>
          <p className="mb-4">
            We respect your privacy. Your onboarding responses, journal entries,
            and personal data are stored securely and used only to personalize
            your experience. We do not share your data with third parties except
            as required by law.
          </p>

          <h2 className="text-xl font-semibold mb-4">6. Data Usage</h2>
          <p className="mb-4">
            Your responses may be embedded using AI technology for
            personalization. All data processing is done securely and in
            accordance with privacy best practices.
          </p>

          <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms & Conditions from time to time. Continued
            use of CalmHive after changes constitutes acceptance of the updated
            terms.
          </p>

          <h2 className="text-xl font-semibold mb-4">
            8. Limitation of Liability
          </h2>
          <p className="mb-4">
            CalmHive and its creators are not liable for any damages, injuries,
            or outcomes resulting from use of the service. Use at your own risk.
          </p>

          <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
          <p className="mb-4">
            If you have questions about these terms, please contact us at
            support@calmhive.com.
          </p>
        </div>

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
    </div>
  );
}

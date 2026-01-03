"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingResponses } from "@/actions/onboarding/onboarding";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { Button } from "@/components/ui/button";

export default function OnboardingCompletePage() {
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const data = await getOnboardingResponses();
        setResponses(data.responses);
      } catch (error) {
        console.error("Failed to fetch responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--ch-sage-dark)] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 md:p-8 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-12  w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--ch-sage-dark)] mb-2">
            You&apos;re All Set!
          </h1>
          <p className="text-[var(--foreground)]/70 text-lg">
            Thank you for completing your onboarding. Here&apos;s what you
            shared with us:
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {ONBOARDING_QUESTIONS.map((question) => {
            const answer = responses[question.key];
            if (!answer) return null;

            // Convert answer to displayable string
            let displayAnswer = "";
            if (typeof answer === "string") {
              displayAnswer = answer;
            } else if (Array.isArray(answer)) {
              displayAnswer = answer.join(", ");
            } else if (typeof answer === "object") {
              displayAnswer = JSON.stringify(answer);
            } else {
              displayAnswer = String(answer);
            }

            return (
              <div
                key={question.key}
                className="bg-[var(--ch-sage-light)]/30 rounded-2xl p-4 md:p-6"
              >
                <h3 className="font-semibold text-[var(--ch-sage-dark)] mb-2">
                  {question.text}
                </h3>
                <p className="text-[var(--foreground)]/80">{displayAnswer}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={() => router.push("/user")}
            className="bg-[var(--ch-sage-dark)] text-white px-8 py-3 rounded-xl hover:bg-[var(--ch-sage-dark)]/90 transition text-lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

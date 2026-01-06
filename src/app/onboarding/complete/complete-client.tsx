"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { GoalSpecificInfo } from "@/types/onboarding";

interface Props {
  responses: {
    age: string;
    goals: string;
    goalSpecificInfo: GoalSpecificInfo | null;
    timeAvailability: string;
    activities: string;
    energeticTime: string;
    additionalNotes: string;
  };
}

export default function OnboardingCompleteClient({ responses }: Props) {
  const router = useRouter();

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
            // Special handling for goalSpecificInfo
            if (question.key === "goalSpecificInfo") {
              const goalInfo = responses.goalSpecificInfo;
              if (!goalInfo) return null;
              return (
                <div
                  key={question.key}
                  className="bg-[var(--ch-sage-light)]/30 rounded-2xl p-4 md:p-6"
                >
                  <h3 className="font-semibold text-[var(--ch-sage-dark)] mb-2">
                    {goalInfo.question}
                  </h3>
                  <p className="text-[var(--foreground)]/80">
                    {goalInfo.answer}
                  </p>
                </div>
              );
            }

            const key = question.key as keyof typeof responses;
            const answer = responses[key];
            if (!answer) return null;

            let displayAnswer = "";
            if (typeof answer === "string") {
              displayAnswer = answer;
            } else if (Array.isArray(answer)) {
              displayAnswer = answer.join(", ");
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

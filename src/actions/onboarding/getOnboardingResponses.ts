"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import db from "@/lib/db";
import type { GoalSpecificInfo, OnboardingResponses } from "@/types/onboarding";

// Retrieve the current onboarding responses
export async function getOnboardingResponses(): Promise<OnboardingResponses> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const onboarding = await db.onboarding.findUnique({
    where: { userId: session.user.id },
  });

  if (!onboarding) {
    throw new Error("Onboarding data not found");
  }

  let goalSpecificInfo: GoalSpecificInfo | null = null;
  if (onboarding.goalSpecificInfo) {
    if (typeof onboarding.goalSpecificInfo === "object") {
      // Already parsed
      const obj = onboarding.goalSpecificInfo as Record<string, unknown>;
      if (typeof obj.question === "string" && typeof obj.answer === "string") {
        goalSpecificInfo = { question: obj.question, answer: obj.answer };
      }
    } else if (typeof onboarding.goalSpecificInfo === "string") {
      try {
        const parsed = JSON.parse(onboarding.goalSpecificInfo) as Record<
          string,
          unknown
        >;
        if (
          typeof parsed.question === "string" &&
          typeof parsed.answer === "string"
        ) {
          goalSpecificInfo = {
            question: parsed.question,
            answer: parsed.answer,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    responses: {
      age: onboarding.age?.toString() || "",
      goals: onboarding.goals,
      goalSpecificInfo,
      timeAvailability: onboarding.timeAvailability?.toString() || "",
      activities: onboarding.activities,
      energeticTime: onboarding.energeticTime,
      additionalNotes: onboarding.additionalNotes || "",
    },
    completedAt: onboarding.completedAt,
  };
}

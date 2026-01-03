"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";

// Retrieve the current onboarding responses
export async function getOnboardingResponses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const onboarding = await db.onboarding.findUnique({
    where: { userId: session.user.id },
  });

  if (!onboarding) {
    throw new Error("Onboarding data not found");
  }

  // Return as a responses object mapping
  return {
    responses: {
      age: onboarding.age?.toString() || "",
      goals: onboarding.goals,
      goalSpecificInfo: onboarding.goalSpecificInfo,
      timeAvailability: onboarding.timeAvailability?.toString() || "",
      activities: onboarding.activities,
      energeticTime: onboarding.energeticTime,
      additionalNotes: onboarding.additionalNotes || "",
    },
    completedAt: onboarding.completedAt,
  };
}

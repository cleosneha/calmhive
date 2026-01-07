import prisma from "@/lib/db";
import type { PlanStateType } from "../state";
import type { OnboardingData } from "../types";

/**
 * Node: Fetch onboarding data from database
 * This is the entry point for the plan generation workflow
 */
export async function fetchOnboardingDataNode(
  state: PlanStateType
): Promise<Partial<PlanStateType>> {
  try {
    const { userId } = state;

    if (!userId) {
      return {
        error: "User ID is required",
        isComplete: false,
      };
    }

    // Fetch onboarding data
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      return {
        error: "Onboarding data not found",
        isComplete: false,
      };
    }

    // Map database fields to OnboardingData type
    // Note: timeAvailability is stored in minutes in the database
    const onboardingData: OnboardingData = {
      userId: onboarding.userId,
      age: onboarding.age,
      goals: onboarding.goals,
      goalSpecificInfo: onboarding.goalSpecificInfo as Record<string, unknown>,
      timeAvailability: onboarding.timeAvailability,
      activities: onboarding.activities,
      energeticTime: onboarding.energeticTime,
      daysOff: onboarding.daysOff,
      additionalNotes: onboarding.additionalNotes || undefined,
    };

    console.log("✅ Fetched onboarding data for user:", userId);

    return {
      onboardingData,
      error: null,
    };
  } catch (error) {
    console.error("❌ Error fetching onboarding data:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch onboarding data",
      isComplete: false,
    };
  }
}

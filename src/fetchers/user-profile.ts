import { getCurrentUser } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { parseEnergeticTime, minutesToTimeFormat } from "@/utils/time-parser";

export interface UserProfileData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  stopEmail: boolean;
  onboarding: {
    age: number;
    goals: string;
    goalSpecificInfo: unknown;
    timeAvailability: string;
    activities: string;
    energeticTime: string;
    daysOff: string[];
    additionalNotes: string | null;
  } | null;
}

/**
 * Fetch current user profile with onboarding data
 */
export async function fetchUserProfile(): Promise<UserProfileData | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const userWithOnboarding = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        stopEmail: true,
        onboarding: {
          select: {
            age: true,
            goals: true,
            goalSpecificInfo: true,
            timeAvailability: true,
            activities: true,
            energeticTime: true,
            daysOff: true,
            additionalNotes: true,
          },
        },
      },
    });

    if (!userWithOnboarding) {
      return null;
    }

    // Parse energetic time from DB format to from/to format
    const parsedEnergeticTime = parseEnergeticTime(
      userWithOnboarding.onboarding?.energeticTime || null,
    );
    const energeticTimeString = parsedEnergeticTime
      ? `${parsedEnergeticTime.from}-${parsedEnergeticTime.to}`
      : userWithOnboarding.onboarding?.energeticTime || "";

    return {
      id: userWithOnboarding.id,
      email: userWithOnboarding.email,
      name: userWithOnboarding.name,
      image: userWithOnboarding.image,
      stopEmail: userWithOnboarding.stopEmail,
      onboarding: userWithOnboarding.onboarding
        ? {
            ...userWithOnboarding.onboarding,
            timeAvailability: minutesToTimeFormat(
              userWithOnboarding.onboarding.timeAvailability,
            ),
            energeticTime: energeticTimeString,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

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
    dateOfBirth: Date;
    goals: string;
    goalSpecificInfo: unknown;
    timeAvailability: string;
    activities: string;
    energeticTime: string;
    daysOff: string[];
    additionalNotes: string | null;
  } | null;
}

interface Task {
  timeRange: string;
}

/**
 * Check if a string is in valid time range format (HH:MM-HH:MM)
 */
function isValidTimeRange(timeRange: string | null | undefined): boolean {
  if (!timeRange || typeof timeRange !== "string") return false;
  const timeRangeRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
  return timeRangeRegex.test(timeRange.trim());
}

/**
 * Extract time range from plan tasks
 * Finds the earliest start time and latest end time from all tasks
 */
function extractTimeRangeFromTasks(tasks: Task[]): string | null {
  if (!tasks || tasks.length === 0) return null;

  try {
    const times = tasks
      .map((task) => task.timeRange)
      .filter((range): range is string => typeof range === "string");

    if (times.length === 0) return null;

    // Parse all times to get start and end times
    const parsedTimes = times
      .map((range) => {
        const parts = range.split("-").map((t) => t.trim());
        return {
          start: parts[0],
          end: parts[1],
        };
      })
      .filter((t) => t.start && t.end);

    if (parsedTimes.length === 0) return null;

    // Sort start times to find earliest, sort end times to find latest
    const startTimes = parsedTimes.map((t) => t.start).sort();
    const endTimes = parsedTimes.map((t) => t.end).sort();

    const earliestStart = startTimes[0];
    const latestEnd = endTimes[endTimes.length - 1];

    return `${earliestStart}-${latestEnd}`;
  } catch (error) {
    console.error("Error extracting time range from tasks:", error);
    return null;
  }
}

/**
 * Fetch current user profile with onboarding data
 * Falls back to plan data if energeticTime is not set
 */
export async function fetchUserProfile(): Promise<UserProfileData | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Fetch user data and plan data in parallel
    const [userWithOnboarding, plan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          stopEmail: true,
          onboarding: {
            select: {
              dateOfBirth: true,
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
      }),
      // Only fetch plan if we need to fallback on energeticTime
      prisma.plan.findFirst({
        where: { userId: user.id },
        select: {
          tasks: {
            select: {
              timeRange: true,
            },
          },
        },
      }),
    ]);

    if (!userWithOnboarding) {
      return null;
    }

    // Determine energetic time: use DB value only if it's a valid time range, else fallback to plan data
    let energeticTimeString = "";
    if (
      userWithOnboarding.onboarding?.energeticTime &&
      isValidTimeRange(userWithOnboarding.onboarding.energeticTime)
    ) {
      // Use stored energetic time (if it's in valid HH:MM-HH:MM format)
      const parsedEnergeticTime = parseEnergeticTime(
        userWithOnboarding.onboarding.energeticTime,
      );
      energeticTimeString = parsedEnergeticTime
        ? `${parsedEnergeticTime.from}-${parsedEnergeticTime.to}`
        : userWithOnboarding.onboarding.energeticTime;
    }

    // If no valid time range found yet, extract from plan tasks
    if (!energeticTimeString && plan?.tasks && plan.tasks.length > 0) {
      const calculatedRange = extractTimeRangeFromTasks(plan.tasks);
      energeticTimeString = calculatedRange || "";
    }
    // console.log("Energetic Time String:", energeticTimeString);
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

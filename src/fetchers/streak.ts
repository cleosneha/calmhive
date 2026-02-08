import { getCurrentUser } from "@/actions/auth";
import { prisma } from "@/lib/db";
import type { StreakData } from "@/types/streak";

/**
 * Fetches user's current streak data
 */
export async function getUserStreak(): Promise<StreakData | null> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return null;
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        streak: true,
        maxStreak: true,
        lastStreakUpdate: true,
      },
    });

    if (!userData) {
      return null;
    }

    return {
      streak: userData.streak,
      maxStreak: userData.maxStreak,
      lastStreakUpdate: userData.lastStreakUpdate,
    };
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return null;
  }
}

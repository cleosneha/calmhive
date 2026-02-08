"use server";

import prisma from "@/lib/db";
import { differenceInDays } from "date-fns";
import { getTodayDateUTC, getStartOfDayUTC } from "@/utils/date";
import type { StreakUpdateInput, StreakUpdateResponse } from "@/types/streak";

/**
 * Updates user's streak based on task status changes
 * - Increments streak when user completes tasks on consecutive days
 * - Decrements streak if all tasks of a day are set back to pending
 * - Resets streak to 0 if user is inactive for a day
 * All dates are stored and compared in UTC for consistency across timezones
 */
export async function updateStreak(
  input: StreakUpdateInput,
): Promise<StreakUpdateResponse> {
  try {
    const { userId, taskDate, newStatus } = input;

    // Get user's current streak data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        maxStreak: true,
        lastStreakUpdate: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get current date in UTC (start of day) - DB always stores UTC
    const todayStartUTC = getTodayDateUTC();

    // Get all tasks for the user's current week (to check daily completion)
    const plan = await prisma.plan.findUnique({
      where: { userId },
      include: {
        tasks: {
          where: { day: taskDate },
        },
      },
    });

    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    let newStreak = user.streak;
    let newMaxStreak = user.maxStreak;
    const lastUpdate = user.lastStreakUpdate;

    // Check if this is a new day
    if (!lastUpdate) {
      // First time updating streak
      if (newStatus !== "pending") {
        newStreak = 1;
      } else {
        newStreak = 0;
      }
    } else {
      // Convert lastUpdate to UTC start of day for comparison
      const lastUpdateStart = getStartOfDayUTC(lastUpdate);
      const daysDifference = differenceInDays(todayStartUTC, lastUpdateStart);

      if (daysDifference === 0) {
        // Same day - check if all tasks are pending
        const allTasksPending = plan.tasks.every(
          (task) => task.status === "pending",
        );

        if (allTasksPending && newStatus === "pending") {
          // All tasks including the current one are pending - decrease streak
          newStreak = Math.max(0, newStreak - 1);
        }
        // If at least one task is done/partial, maintain current streak
      } else if (daysDifference === 1) {
        // Next consecutive day
        if (newStatus !== "pending") {
          // User is completing at least one task - increment streak
          newStreak += 1;
        } else {
          // User is setting tasks to pending on a new day - maintain or reset
          const hasNonPendingTasks = plan.tasks.some(
            (task) => task.status !== "pending",
          );
          if (!hasNonPendingTasks) {
            // If all tasks are pending, don't increment
            newStreak = 0;
          } else {
            // If there's at least one non-pending task, increment
            newStreak += 1;
          }
        }
      } else if (daysDifference > 1) {
        // Gap detected - user was inactive - reset streak
        if (newStatus !== "pending") {
          newStreak = 1; // Start fresh streak
        } else {
          newStreak = 0;
        }
      }
    }

    // Update max streak if current streak exceeds it
    if (newStreak > newMaxStreak) {
      newMaxStreak = newStreak;
    }

    // Update user's streak data
    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        maxStreak: newMaxStreak,
        lastStreakUpdate: todayStartUTC,
      },
    });

    return {
      success: true,
      message: "Streak updated successfully",
      data: {
        streak: newStreak,
        maxStreak: newMaxStreak,
      },
    };
  } catch (error) {
    console.error("Error updating streak:", error);
    return {
      success: false,
      message: "Failed to update streak",
    };
  }
}

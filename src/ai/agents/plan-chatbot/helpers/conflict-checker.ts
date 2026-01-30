import prisma from "@/lib/db";
import { doTimeRangesOverlap } from "../utils/time-parser";

/**
 * Check if there's a time conflict for the given day and time
 * Now checks for overlapping time ranges, not just exact matches
 */
export async function checkTimeConflict(
  userId: string,
  day: string,
  timeRange: string,
  excludeActivity?: string,
): Promise<{
  hasConflict: boolean;
  conflictingActivity?: string;
  conflictingTime?: string;
}> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { hasConflict: false };
    }

    // Check for overlapping time conflicts
    const conflictingTask = plan.tasks.find(
      (task) =>
        task.day.toLowerCase() === day.toLowerCase() &&
        doTimeRangesOverlap(task.timeRange, timeRange) &&
        (!excludeActivity ||
          task.activity.toLowerCase() !== excludeActivity.toLowerCase()),
    );

    if (conflictingTask) {
      return {
        hasConflict: true,
        conflictingActivity: conflictingTask.activity,
        conflictingTime: conflictingTask.timeRange,
      };
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("[checkTimeConflict] Error:", error);
    return { hasConflict: false };
  }
}

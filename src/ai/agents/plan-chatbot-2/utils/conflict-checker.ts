import prisma from "@/lib/db";
import { parseTimeRange } from "./time-parser";

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(range1: string, range2: string): boolean {
  const parsed1 = parseTimeRange(range1);
  const parsed2 = parseTimeRange(range2);

  if (!parsed1 || !parsed2) return false;

  return (
    parsed1.startMinutes < parsed2.endMinutes &&
    parsed2.startMinutes < parsed1.endMinutes
  );
}

/**
 * Check if there's a time conflict for the given day and time
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

/**
 * Find conflicting task for a given time slot
 */
export async function findConflictingTask(
  userId: string,
  day: string,
  timeRange: string,
): Promise<{
  id: number;
  activity: string;
  timeRange: string;
} | null> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) return null;

    const task = plan.tasks.find(
      (t) =>
        t.day.toLowerCase() === day.toLowerCase() &&
        doTimeRangesOverlap(t.timeRange, timeRange),
    );

    if (task) {
      return {
        id: task.id,
        activity: task.activity,
        timeRange: task.timeRange,
      };
    }

    return null;
  } catch {
    return null;
  }
}

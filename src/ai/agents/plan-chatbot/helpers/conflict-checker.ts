import prisma from "@/lib/db";

/**
 * Check if there's a time conflict for the given day and time
 */
export async function checkTimeConflict(
  userId: string,
  day: string,
  timeRange: string,
  excludeActivity?: string
): Promise<{ hasConflict: boolean; conflictingActivity?: string }> {
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
        task.timeRange === timeRange &&
        (!excludeActivity ||
          task.activity.toLowerCase() !== excludeActivity.toLowerCase())
    );

    if (conflictingTask) {
      return {
        hasConflict: true,
        conflictingActivity: conflictingTask.activity,
      };
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("[checkTimeConflict] Error:", error);
    return { hasConflict: false };
  }
}

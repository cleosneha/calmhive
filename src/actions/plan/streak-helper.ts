"use server";

import { updateStreak } from "./update-streak";
import prisma from "@/lib/db";

/**
 * Helper function to update user streak based on task day
 * Determines the appropriate status to use for streak calculation
 */
export async function updateUserStreak(
  userId: string,
  taskDay: string,
): Promise<void> {
  try {
    // Get all tasks for this day to determine overall status
    const plan = await prisma.plan.findUnique({
      where: { userId },
      include: {
        tasks: {
          where: { day: taskDay },
        },
      },
    });

    if (!plan || plan.tasks.length === 0) {
      return;
    }

    // Determine the status for streak calculation
    // If any task is done or partial, consider it as "done" for streak
    const hasCompletedTask = plan.tasks.some(
      (task) => task.status === "done" || task.status === "partial",
    );

    const statusForStreak = hasCompletedTask ? "done" : "pending";

    // Update the streak
    await updateStreak({
      userId,
      taskDate: taskDay,
      newStatus: statusForStreak,
    });
  } catch (error) {
    console.error("Error in updateUserStreak:", error);
    // Don't throw - this is a helper function and shouldn't break the main flow
  }
}

/**
 * Validation utilities for plan chatbot remove task operations
 */

import prisma from "@/lib/db";

/**
 * Find task by activity name (oldActivity from LLM)
 */
export async function findTaskByActivity(
  userId: string,
  activity: string,
  day?: string,
  timeRange?: string
): Promise<{
  task: { id: number; activity: string; day: string; timeRange: string } | null;
  error?: string;
  isLastTask?: boolean;
}> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { task: null, error: "No plan found" };
    }

    // Search for task by activity name (case-insensitive)
    // Optionally filter by day and timeRange if provided
    let matchingTask = plan.tasks.find((t) => {
      const activityMatch = t.activity.toLowerCase() === activity.toLowerCase();
      const dayMatch = day ? t.day.toLowerCase() === day.toLowerCase() : true;
      const timeMatch = timeRange ? t.timeRange === timeRange : true;
      return activityMatch && dayMatch && timeMatch;
    });

    // If not found with exact match, try partial match
    if (!matchingTask) {
      matchingTask = plan.tasks.find((t) =>
        t.activity.toLowerCase().includes(activity.toLowerCase())
      );
    }

    if (!matchingTask) {
      return {
        task: null,
        error: `Task "${activity}" not found in your plan`,
      };
    }

    return {
      task: {
        id: matchingTask.id,
        activity: matchingTask.activity,
        day: matchingTask.day,
        timeRange: matchingTask.timeRange,
      },
      isLastTask: plan.tasks.length === 1,
    };
  } catch (error) {
    console.error("Error finding task:", error);
    return {
      task: null,
      error: "Failed to find task",
    };
  }
}

/**
 * Validate task removal request
 */
export async function validateRemoveTask(
  userId: string,
  activity: string,
  day?: string,
  timeRange?: string
): Promise<{
  isValid: boolean;
  taskId?: number;
  taskActivity?: string;
  taskDay?: string;
  taskTimeRange?: string;
  isLastTask?: boolean;
  error?: string;
}> {
  if (!activity || activity.trim().length === 0) {
    return {
      isValid: false,
      error: "Activity name is required to remove a task",
    };
  }

  const result = await findTaskByActivity(userId, activity, day, timeRange);

  if (!result.task) {
    return {
      isValid: false,
      error: result.error || "Task not found",
    };
  }

  return {
    isValid: true,
    taskId: result.task.id,
    taskActivity: result.task.activity,
    taskDay: result.task.day,
    taskTimeRange: result.task.timeRange,
    isLastTask: result.isLastTask,
  };
}

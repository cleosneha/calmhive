"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { updateStreak } from "./update-streak";
import { updateUserStreak } from "./streak-helper";

/**
 * Get current day of week as string (Monday, Tuesday, etc.)
 */
function getCurrentDayOfWeek(): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  return days[today.getDay()];
}

interface UpdateTaskStatusInput {
  taskId: number;
  status: "pending" | "done" | "partial";
}

interface UpdateTaskStatusResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
  };
}

export async function updateTaskStatus(
  input: UpdateTaskStatusInput,
): Promise<UpdateTaskStatusResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const { taskId, status } = input;

    // Validate status value
    const validStatuses = ["pending", "done", "partial"];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status value",
      };
    }

    // Verify task belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        plan: {
          userId: user.id,
        },
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    // Check if task belongs to current day
    const currentDay = getCurrentDayOfWeek();
    if (task.day !== currentDay) {
      return {
        success: false,
        message: `You can only update tasks for today (${currentDay}). This task is for ${task.day}.`,
      };
    }

    // Prevent updating status if it's the same as current
    if (task.status === status) {
      return {
        success: true,
        message: "Task status is already set to this value",
        data: {
          id: task.id,
          status: task.status,
        },
      };
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
        plan: {
          update: {
            updatedAt: new Date(), // Prisma converts to UTC automatically
          },
        },
      },
    });

    // Update user's streak using the helper function
    // This ensures streak is updated based on all tasks of the day
    try {
      await updateUserStreak(user.id, task.day);
    } catch (streakError) {
      console.error("Error updating streak:", streakError);
      // Don't fail the whole operation if streak update fails
    }

    return {
      success: true,
      message: "Task status updated successfully",
      data: {
        id: updatedTask.id,
        status: updatedTask.status,
      },
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      message: "Failed to update task status",
    };
  }
}

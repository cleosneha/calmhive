"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";

interface UpdateTaskStatusInput {
  taskId: number;
  status: "pending" | "done" | "skipped" | "partial";
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
  input: UpdateTaskStatusInput
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
    const validStatuses = ["pending", "done", "skipped", "partial"];
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

    // Update task status
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
        plan: {
          update: {
            updatedAt: new Date(),
          },
        },
      },
    });

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

"use server";

import { getCurrentUser } from "@/actions/auth";
import { deletePlanEmbedding } from "@/actions/plan/process-embedding";
import prisma from "@/lib/db";
import { calculateHoursSummaryFromTasks } from "@/utils/duration";

interface RemoveTaskInput {
  taskId: number;
}

interface RemoveTaskResponse {
  success: boolean;
  message: string;
  data?: {
    taskId: number;
    planDeleted?: boolean;
  };
}

/**
 * Remove a task from the plan
 * - Deletes the task from the database
 * - Updates hoursSummary
 * - If this was the only task in the plan, deletes the entire plan and its embedding
 * - Otherwise, updates the plan's embedding with remaining tasks
 */
export async function removeTask(
  input: RemoveTaskInput
): Promise<RemoveTaskResponse> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const { taskId } = input;

    // Get the task to find the plan ID
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        plan: {
          userId: user.id,
        },
      },
      include: {
        plan: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    const plan = task.plan;

    // Check if this is the only task in the plan
    const remainingTasksCount = plan.tasks.length - 1;

    if (remainingTasksCount === 0) {
      // Delete the entire plan
      await prisma.plan.delete({
        where: {
          id: plan.id,
        },
      });

      // Delete plan embedding
      await deletePlanEmbedding(user.id);

      return {
        success: true,
        message: "Task removed. Plan deleted as it had no other tasks.",
        data: {
          taskId,
          planDeleted: true,
        },
      };
    }

    // Delete the task
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    // Get remaining tasks
    const remainingTasks = await prisma.task.findMany({
      where: {
        planId: plan.id,
      },
    });

    // Recalculate hoursSummary
    const newHoursSummary = calculateHoursSummaryFromTasks(
      remainingTasks,
      plan.daysOff
    );

    // Update plan with new hoursSummary
    const updatedPlan = await prisma.plan.update({
      where: {
        id: plan.id,
      },
      data: {
        hoursSummary: newHoursSummary,
        updatedAt: new Date(),
      },
      include: {
        tasks: true,
      },
    });

    // Re-embed the plan with updated tasks
    const { embedPlan } = await import("@/actions/plan/process-embedding");
    const embedResult = await embedPlan(
      user.id,
      updatedPlan.id,
      updatedPlan.tasks,
      updatedPlan.daysOff
    );

    if (!embedResult.success) {
      // console.warn( "⚠️ Failed to update plan embedding after task deletion:", embedResult.error );
      // Don't fail the operation if embedding fails, as the DB is already updated
    }

    return {
      success: true,
      message: "Task removed successfully",
      data: {
        taskId,
        planDeleted: false,
      },
    };
  } catch (error) {
    console.error("Error removing task:", error);
    return {
      success: false,
      message: "Failed to remove task",
    };
  }
}

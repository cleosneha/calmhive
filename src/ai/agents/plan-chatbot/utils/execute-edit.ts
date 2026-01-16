import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";

/**
 * Execute plan edit in database and vector store
 */
export async function executePlanEdit(
  userId: string,
  editType:
    | "add_task"
    | "remove_task"
    | "modify_task"
    | "change_days_off"
    | "other",
  data: Record<string, unknown>,
  planId?: number | null
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  previousData?: Record<string, unknown>;
}> {
  try {
    // Find user's plan
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found for this user" };
    }

    let result: {
      success: boolean;
      message?: string;
      previousData?: Record<string, unknown>;
    } = { success: false };

    switch (editType) {
      case "add_task": {
        const { day, timeRange, activity } = data as {
          day: string;
          timeRange: string;
          activity: string;
        };

        const newTask = await prisma.task.create({
          data: {
            planId: plan.id,
            day,
            timeRange,
            activity,
            status: "pending",
          },
        });

        result = {
          success: true,
          message: `Added **${activity}** on **${day}** at **${timeRange}**.`,
          previousData: { taskId: newTask.id }, // Store new task ID for undo (removal)
        };
        break;
      }

      case "remove_task": {
        const { taskId } = data as { taskId?: number };

        if (!taskId) {
          return { success: false, error: "Task ID is required" };
        }

        // Verify task belongs to user's plan
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { plan: true },
        });

        if (!task || task.plan.userId !== userId) {
          return {
            success: false,
            error: "Task not found or doesn't belong to this user",
          };
        }

        // Store task data for undo (re-adding)
        const previousData = {
          day: task.day,
          timeRange: task.timeRange,
          activity: task.activity,
        };

        await prisma.task.delete({
          where: { id: taskId },
        });

        result = {
          success: true,
          message: `Removed **${task.activity}** from **${task.day}**.`,
          previousData,
        };
        break;
      }

      case "modify_task": {
        const { taskId, day, timeRange, activity } = data as {
          taskId?: number;
          day?: string;
          timeRange?: string;
          activity?: string;
        };

        if (!taskId) {
          return { success: false, error: "Task ID is required" };
        }

        // Verify task belongs to user's plan
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { plan: true },
        });

        if (!task || task.plan.userId !== userId) {
          return {
            success: false,
            error: "Task not found or doesn't belong to this user",
          };
        }

        // Store previous task data for undo
        const previousData = {
          taskId: task.id,
          day: task.day,
          timeRange: task.timeRange,
          activity: task.activity,
        };

        const updated = await prisma.task.update({
          where: { id: taskId },
          data: {
            ...(day && { day }),
            ...(timeRange && { timeRange }),
            ...(activity && { activity }),
          },
        });

        result = {
          success: true,
          message: `Updated task on **${updated.day}**: **${updated.activity}**.`,
          previousData,
        };
        break;
      }

      case "change_days_off": {
        const { daysOff } = data as { daysOff?: string[] };

        if (!daysOff || !Array.isArray(daysOff)) {
          return { success: false, error: "Days off array is required" };
        }

        // Store previous days off for undo
        const previousData = {
          daysOff: plan.daysOff,
        };

        await prisma.plan.update({
          where: { id: plan.id },
          data: { daysOff },
        });

        result = {
          success: true,
          message: `Updated days off to: **${daysOff.join(", ")}**.`,
          previousData,
        };
        break;
      }

      default:
        return { success: false, error: "Unknown edit type" };
    }

    // Update embeddings after successful edit
    if (result.success) {
      // Fetch fresh tasks after the edit
      const updatedPlan = await prisma.plan.findUnique({
        where: { id: plan.id },
        include: { tasks: true },
      });

      if (updatedPlan) {
        // Update vector store with new plan data
        await embedPlan(
          userId,
          plan.id,
          updatedPlan.tasks,
          updatedPlan.daysOff
        );
        console.log("✅ Embeddings updated after plan edit");
      }
    }

    return result;
  } catch (error) {
    console.error("Error executing plan edit:", error);
    return {
      success: false,
      error: "Failed to update plan in database",
    };
  }
}

import prisma from "@/lib/db";

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
  data: Record<string, unknown>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Find user's plan
    const plan = await prisma.plan.findFirst({
      where: { userId },
    });

    if (!plan) {
      return { success: false, error: "No plan found for this user" };
    }

    switch (editType) {
      case "add_task": {
        const { day, timeRange, activity } = data as {
          day: string;
          timeRange: string;
          activity: string;
        };

        await prisma.task.create({
          data: {
            planId: plan.id,
            day,
            timeRange,
            activity,
            status: "pending",
          },
        });

        // TODO: Update vector store with new task
        // await updateVectorStore(userId, plan.id);

        return {
          success: true,
          message: `Added **${activity}** on **${day}** at **${timeRange}**.`,
        };
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

        await prisma.task.delete({
          where: { id: taskId },
        });

        // TODO: Update vector store
        // await updateVectorStore(userId, plan.id);

        return {
          success: true,
          message: `Removed **${task.activity}** from **${task.day}**.`,
        };
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

        const updated = await prisma.task.update({
          where: { id: taskId },
          data: {
            ...(day && { day }),
            ...(timeRange && { timeRange }),
            ...(activity && { activity }),
          },
        });

        // TODO: Update vector store
        // await updateVectorStore(userId, plan.id);

        return {
          success: true,
          message: `Updated task on **${updated.day}**: **${updated.activity}**.`,
        };
      }

      case "change_days_off": {
        const { daysOff } = data as { daysOff?: string[] };

        if (!daysOff || !Array.isArray(daysOff)) {
          return { success: false, error: "Days off array is required" };
        }

        await prisma.plan.update({
          where: { id: plan.id },
          data: { daysOff },
        });

        // TODO: Update vector store
        // await updateVectorStore(userId, plan.id);

        return {
          success: true,
          message: `Updated days off to: **${daysOff.join(", ")}**.`,
        };
      }

      default:
        return { success: false, error: "Unknown edit type" };
    }
  } catch (error) {
    console.error("Error executing plan edit:", error);
    return {
      success: false,
      error: "Failed to update plan in database",
    };
  }
}

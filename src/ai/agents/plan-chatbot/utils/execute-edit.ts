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
  data: Record<string, unknown>
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
        const { taskId, day, timeRange, activity, oldActivity, notes } =
          data as {
            taskId?: number;
            day?: string;
            timeRange?: string;
            activity?: string;
            oldActivity?: string;
            notes?: string;
          };

        let task;

        // If taskId is provided, use it directly
        if (taskId) {
          task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { plan: true },
          });

          if (!task || task.plan.userId !== userId) {
            return {
              success: false,
              error: "Task not found or doesn't belong to this user",
            };
          }
        } else {
          // Find task by matching oldActivity, day, and timeRange
          if (!oldActivity || !day || !timeRange) {
            return {
              success: false,
              error:
                "Task identification info (oldActivity, day, timeRange) is required",
            };
          }

          // Find matching task in user's plan
          const tasks = plan.tasks.filter(
            (t) =>
              t.day.toLowerCase() === day.toLowerCase() &&
              t.timeRange === timeRange &&
              t.activity.toLowerCase().includes(oldActivity.toLowerCase())
          );

          if (tasks.length === 0) {
            return {
              success: false,
              error: `Could not find task "${oldActivity}" on ${day} at ${timeRange}`,
            };
          }

          if (tasks.length > 1) {
            return {
              success: false,
              error: "Multiple matching tasks found. Please be more specific.",
            };
          }

          task = tasks[0];
        }

        // Store previous task data for undo
        const previousData = {
          taskId: task.id,
          day: task.day,
          timeRange: task.timeRange,
          activity: task.activity,
          notes: task.notes,
        };

        const updated = await prisma.task.update({
          where: { id: task.id },
          data: {
            ...(day && { day }),
            ...(timeRange && { timeRange }),
            ...(activity && { activity }),
            ...(notes && { notes }),
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

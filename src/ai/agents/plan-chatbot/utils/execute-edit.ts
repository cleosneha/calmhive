import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";
import { calculateHoursSummaryFromTasks } from "@/utils/duration";
import { addTask } from "@/actions/plan/add-task";
import { removeTask } from "@/actions/plan/remove-task";
import {
  executeAddDaysOff,
  executeRemoveDays,
  executeCopyDay,
  executeRenameDay,
  executeSwapDays,
} from "./execute-day-operations";

/**
 * Execute plan edit in database and vector store
 * Also updates hoursSummary when plan is modified
 */
export async function executePlanEdit(
  userId: string,
  editType:
    | "add_task"
    | "remove_task"
    | "modify_task"
    | "change_days_off"
    | "add_days_off"
    | "remove_days"
    | "copy_day"
    | "rename_day"
    | "swap_days"
    | "other",
  data: Record<string, unknown>,
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
        const { day, timeRange, activity, notes } = data as {
          day: string;
          timeRange: string;
          activity: string;
          notes?: string;
        };

        // Use the addTask action which handles all validations, embedding, and hoursSummary
        const addResult = await addTask({
          day,
          timeRange,
          activity,
          notes: notes || null,
        });

        if (!addResult.success) {
          return {
            success: false,
            error: addResult.message || "Failed to add task",
          };
        }

        result = {
          success: true,
          message: `Added **${activity}** on **${day}** at **${timeRange}**.`,
          previousData: { taskId: addResult.data?.taskId },
        };
        break;
      }

      case "remove_task": {
        const { taskId } = data as { taskId?: number };

        if (!taskId) {
          return { success: false, error: "Task ID is required" };
        }

        // Use the removeTask action which handles all validations, embedding, and hoursSummary
        const removeResult = await removeTask({ taskId });

        if (!removeResult.success) {
          return {
            success: false,
            error: removeResult.message || "Failed to remove task",
          };
        }

        // Check if plan was deleted (last task)
        if (removeResult.data?.planDeleted) {
          result = {
            success: true,
            message:
              "Task removed and your plan has been deleted as it had no other tasks.",
            previousData: { planDeleted: true },
          };
        } else {
          result = {
            success: true,
            message: `Task removed successfully.`,
            previousData: { taskId },
          };
        }
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
              t.activity.toLowerCase().includes(oldActivity.toLowerCase()),
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

        // Recalculate hoursSummary if timeRange or day changed
        if (timeRange || day) {
          const updatedTasksForModify = plan.tasks.map((t) =>
            t.id === task.id ? updated : t,
          );
          const newHoursSummary = calculateHoursSummaryFromTasks(
            updatedTasksForModify,
            plan.daysOff,
          );

          // Update plan with new hoursSummary
          await prisma.plan.update({
            where: { id: plan.id },
            data: { hoursSummary: newHoursSummary },
          });
        }

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

        // Recalculate hoursSummary with new days off
        const newHoursSummary = calculateHoursSummaryFromTasks(
          plan.tasks,
          daysOff,
        );

        await prisma.plan.update({
          where: { id: plan.id },
          data: { daysOff, hoursSummary: newHoursSummary },
        });

        result = {
          success: true,
          message: `Updated days off to: **${daysOff.join(", ")}**.`,
          previousData,
        };
        break;
      }

      case "add_days_off": {
        const { daysToAdd } = data as { daysToAdd: string[] };
        return await executeAddDaysOff(userId, daysToAdd);
      }

      case "remove_days": {
        const { daysToRemove } = data as { daysToRemove: string[] };
        return await executeRemoveDays(userId, daysToRemove);
      }

      case "copy_day": {
        const { sourceDay, targetDay, deleteExisting } = data as {
          sourceDay: string;
          targetDay: string;
          deleteExisting?: boolean;
        };
        return await executeCopyDay(
          userId,
          sourceDay,
          targetDay,
          deleteExisting,
        );
      }

      case "rename_day": {
        const { oldDay, newDay, deleteExistingNew } = data as {
          oldDay: string;
          newDay: string;
          deleteExistingNew?: boolean;
        };
        return await executeRenameDay(
          userId,
          oldDay,
          newDay,
          deleteExistingNew,
        );
      }

      case "swap_days": {
        const { day1, day2 } = data as { day1: string; day2: string };
        return await executeSwapDays(userId, day1, day2);
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
          updatedPlan.daysOff,
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

import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";
import {
  calculateHoursSummaryFromTasks,
  getDurationFromTimeRange,
} from "@/utils/duration";
import { addTask } from "@/actions/plan/add-task";
import { removeTask } from "@/actions/plan/remove-task";
import {
  executeAddDaysOff,
  executeRemoveDays,
  executeCopyDay,
  executeRenameDay,
  executeSwapDays,
} from "./execute-day-operations";
import { normalizeTimeRange } from "./time-parser";

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
    | "delete_plan"
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
        const {
          day,
          timeRange,
          activity,
          notes,
          shouldOverwrite,
          conflictingActivity,
          conflictingTime,
        } = data as {
          day: string;
          timeRange: string;
          activity: string;
          notes?: string;
          shouldOverwrite?: boolean;
          conflictingActivity?: string;
          conflictingTime?: string;
        };

        // If overwrite is requested, remove the conflicting task first
        if (shouldOverwrite && conflictingActivity && conflictingTime) {
          console.log(
            "[executePlanEdit] Overwrite requested - removing conflicting task",
          );

          // Find and remove the conflicting task
          const normalizedConflictingTime = normalizeTimeRange(conflictingTime);
          const conflictingTask = plan.tasks.find(
            (task) =>
              task.day.toLowerCase() === day.toLowerCase() &&
              normalizeTimeRange(task.timeRange) ===
                normalizedConflictingTime &&
              task.activity === conflictingActivity,
          );

          if (conflictingTask) {
            console.log(
              "[executePlanEdit] Found conflicting task:",
              conflictingTask.id,
            );
            const removeResult = await removeTask({
              taskId: conflictingTask.id,
            });

            if (!removeResult.success) {
              return {
                success: false,
                error: `Failed to remove conflicting task: ${removeResult.message}`,
              };
            }
            console.log(
              "[executePlanEdit] Conflicting task removed successfully",
            );
          }
        }

        // Use the addTask action which handles all validations, embedding, and hoursSummary
        const addResult = await addTask({
          day,
          timeRange: normalizeTimeRange(timeRange),
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
          message: shouldOverwrite
            ? `Replaced **${conflictingActivity}** with **${activity}** on **${day}** at **${timeRange}**.`
            : `Added **${activity}** on **${day}** at **${timeRange}**.`,
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
        const {
          taskId,
          day,
          timeRange,
          activity,
          oldActivity,
          notes,
          modifyType,
          status,
        } = data as {
          taskId?: number;
          day?: string;
          timeRange?: string;
          activity?: string;
          oldActivity?: string;
          notes?: string;
          modifyType?: "title" | "notes" | "status" | "none";
          status?: "pending" | "done" | "partial";
        };

        console.log("[modify_task] Data received:", {
          taskId,
          day,
          timeRange,
          activity,
          oldActivity,
          notes,
          modifyType,
          status,
        });

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

          console.log("[modify_task] Searching for task with:", {
            oldActivity,
            day,
            timeRange,
          });

          console.log(
            "[modify_task] All tasks in plan:",
            plan.tasks.map((t) => ({
              id: t.id,
              day: t.day,
              timeRange: t.timeRange,
              activity: t.activity,
              normalizedTimeRange: normalizeTimeRange(t.timeRange),
            })),
          );

          // Find matching task in user's plan
          const normalizedTimeRange = normalizeTimeRange(timeRange);
          const tasks = plan.tasks.filter(
            (t) =>
              t.day.toLowerCase() === day.toLowerCase() &&
              normalizeTimeRange(t.timeRange) === normalizedTimeRange &&
              t.activity.toLowerCase().includes(oldActivity.toLowerCase()),
          );

          console.log(
            "[modify_task] Found tasks:",
            tasks.length,
            tasks.map((t) => ({
              id: t.id,
              activity: t.activity,
              timeRange: t.timeRange,
              day: t.day,
            })),
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

        console.log("[modify_task] Task to update:", task);

        // Store previous task data for undo
        const previousData = {
          taskId: task.id,
          day: task.day,
          timeRange: task.timeRange,
          activity: task.activity,
          notes: task.notes,
        };

        // Validate timeRange if provided
        if (timeRange) {
          const duration = getDurationFromTimeRange(timeRange);
          if (duration === 0) {
            return {
              success: false,
              error:
                "Invalid time range format. Please use format like '7:00 AM - 8:00 AM' or '07:00 - 08:00'",
            };
          }
          if (duration < 0.25) {
            // Less than 15 minutes
            return {
              success: false,
              error: "Activity duration must be at least 15 minutes",
            };
          }
          if (duration > 8) {
            // More than 8 hours
            return {
              success: false,
              error: "Activity duration cannot exceed 8 hours",
            };
          }
        }

        const updateData = {
          ...(activity && { activity }),
          ...(notes !== undefined && { notes }),
          ...(modifyType === "status" && status && { status }),
        };

        console.log("[modify_task] Update data:", updateData);

        const updated = await prisma.task.update({
          where: { id: task.id },
          data: updateData,
        });

        console.log("[modify_task] Updated task:", updated);

        result = {
          success: true,
          message: `✅ Task updated successfully on **${updated.day}**: **${updated.activity}**.`,
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
        const {
          sourceDay,
          targetDays,
          targetDay,
          deleteExisting,
          existingTargets,
        } = data as {
          sourceDay: string;
          targetDays?: string[];
          targetDay?: string; // Legacy single target support
          deleteExisting?: boolean;
          existingTargets?: string[];
        };

        // Support both new (targetDays array) and legacy (targetDay string) formats
        const targets = targetDays || (targetDay ? [targetDay] : []);

        return await executeCopyDay(
          userId,
          sourceDay,
          targets,
          deleteExisting,
          existingTargets || [],
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

      case "delete_plan": {
        console.log("  🗑️ Executing delete_plan for userId:", userId);

        // Delete all vector embeddings for this plan
        try {
          const { deletePlanEmbedding } =
            await import("@/actions/plan/process-embedding");
          await deletePlanEmbedding(userId);
          console.log("  ✅ Deleted plan embeddings from vector store");
        } catch (error) {
          console.error("  ❌ Failed to delete plan embeddings:", error);
          // Continue with deletion even if embedding deletion fails
        }

        // Delete all tasks associated with the plan
        await prisma.task.deleteMany({
          where: { planId: plan.id },
        });
        console.log("  ✅ Deleted all tasks");

        // Delete the plan
        await prisma.plan.delete({
          where: { id: plan.id },
        });
        console.log("  ✅ Deleted plan");

        return {
          success: true,
          message:
            "✅ **Plan deleted successfully!**\n\nYour entire wellness plan, including all tasks and data, has been permanently removed.\n\nYou can create a new plan anytime from the Plan page.",
          previousData: {
            planId: plan.id,
            taskCount: plan.tasks.length,
          },
        };
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

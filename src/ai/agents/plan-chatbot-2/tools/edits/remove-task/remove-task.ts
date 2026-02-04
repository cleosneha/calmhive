import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  getPlanFromDatabase,
  normalizeDayName,
  findTaskInPlan,
  findTaskByPartialMatch,
  buildConfirmationMessage,
  buildEditPreview,
} from "../../../utils";
import type { ToolResult, TaskInfo } from "../../../types";

/**
 * Tool to remove a task from the plan
 */
export const removeTaskTool = tool(
  async ({
    userId,
    day,
    activity,
    timeRange,
  }: {
    userId: string;
    day: string;
    activity: string;
    timeRange?: string;
  }): Promise<string> => {
    // Get plan
    const plan = await getPlanFromDatabase(userId);
    if (!plan) {
      return JSON.stringify({
        success: false,
        message: "You don't have a wellness plan yet.",
      } as ToolResult);
    }

    // Validate day
    const normalizedDay = normalizeDayName(day);
    if (!normalizedDay) {
      return JSON.stringify({
        success: false,
        message: `Invalid day "${day}". Please use a valid day name (Monday-Sunday).`,
      } as ToolResult);
    }

    // Find the task
    let task = findTaskInPlan(plan, normalizedDay, activity, timeRange);

    // Try partial match if exact match not found
    if (!task) {
      task = findTaskByPartialMatch(plan, normalizedDay, activity);
    }

    if (!task) {
      // List tasks on that day to help user
      const tasksOnDay = plan.tasks.filter(
        (t: TaskInfo) => t.day.toLowerCase() === normalizedDay.toLowerCase(),
      );

      if (tasksOnDay.length === 0) {
        return JSON.stringify({
          success: false,
          message: `There are no tasks on ${normalizedDay}. Check your plan for the correct day.`,
        } as ToolResult);
      }

      const taskList = tasksOnDay
        .map((t: TaskInfo) => `• ${t.timeRange}: ${t.activity}`)
        .join("\n");

      return JSON.stringify({
        success: false,
        message:
          `I couldn't find "${activity}" on ${normalizedDay}.\n\n` +
          `Here are the tasks on ${normalizedDay}:\n${taskList}\n\n` +
          `Please specify which task you want to remove.`,
      } as ToolResult);
    }

    // Check if this is the last task
    const isLastTask = plan.tasks.length === 1;

    // Build confirmation
    const previewData = {
      day: task.day,
      timeRange: task.timeRange,
      activity: task.activity,
      isLastTask,
    };

    const confirmMessage = buildConfirmationMessage("remove_task", previewData);
    const preview = buildEditPreview("remove_task", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "remove_task",
        data: {
          taskId: task.id,
          day: task.day,
          timeRange: task.timeRange,
          activity: task.activity,
          isLastTask,
        },
        description: `Remove "${task.activity}" from ${task.day}`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "remove_task",
    description: `Remove a task/activity from the user's wellness plan.

IMPORTANT RULES:
1. Always get plan context first to find the correct task
2. Match task by day and activity name (partial matching supported)
3. If task not found, list available tasks on that day
4. Warn user if this is the last task (will delete entire plan)
5. This tool returns a confirmation message - the task is NOT removed until user confirms

Parameters:
- userId: The user's ID
- day: Day of the week where the task is
- activity: Name or partial name of the activity to remove
- timeRange: Optional - helps identify the specific task if multiple with same name`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      day: z.string().describe("Day of the week (Monday-Sunday)"),
      activity: z.string().describe("Name of the activity to remove"),
      timeRange: z
        .string()
        .optional()
        .describe("Time range to identify specific task"),
    }),
  },
);

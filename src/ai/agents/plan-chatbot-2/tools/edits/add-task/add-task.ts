import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  normalizeDayName,
  checkTimeConflict,
  isVagueTime,
  getTimeSlotSuggestion,
  buildConfirmationMessage,
  buildEditPreview,
} from "../../../utils";
import type { ToolResult } from "../../../types";

/**
 * Tool to add a new task to the plan
 */
export const addTaskTool = tool(
  async ({
    userId,
    day,
    timeRange,
    activity,
    notes,
  }: {
    userId: string;
    day: string;
    timeRange: string;
    activity: string;
    notes?: string;
  }): Promise<string> => {
    // Validate day
    const normalizedDay = normalizeDayName(day);
    if (!normalizedDay) {
      return JSON.stringify({
        success: false,
        message: `Invalid day "${day}". Please use a valid day name (Monday-Sunday).`,
      } as ToolResult);
    }

    // Check for vague time
    if (isVagueTime(timeRange)) {
      const suggestion = getTimeSlotSuggestion(timeRange);
      return JSON.stringify({
        success: false,
        message:
          `The time "${timeRange}" is too vague. Please provide a specific time range.\n\n` +
          `Suggested time for "${timeRange}": **${suggestion}**\n\n` +
          `Please confirm this time or provide a different one like "7:00 AM - 8:00 AM".`,
      } as ToolResult);
    }

    // Validate time format
    const timePattern =
      /^\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)$/i;
    if (!timePattern.test(timeRange.trim())) {
      return JSON.stringify({
        success: false,
        message: `Invalid time format "${timeRange}". Please use format like "7:00 AM - 8:00 AM".`,
      } as ToolResult);
    }

    // Check for time conflicts
    const conflict = await checkTimeConflict(userId, normalizedDay, timeRange);
    if (conflict.hasConflict) {
      return JSON.stringify({
        success: false,
        message:
          `There's already a task at this time:\n\n` +
          `📅 **${normalizedDay}** at **${conflict.conflictingTime}**\n` +
          `🎯 **${conflict.conflictingActivity}**\n\n` +
          `Would you like to:\n` +
          `1. Replace the existing task with "${activity}"?\n` +
          `2. Choose a different time slot?\n\n` +
          `Please let me know how you'd like to proceed.`,
        conflictInfo: {
          activity: conflict.conflictingActivity,
          timeRange: conflict.conflictingTime,
        },
      } as ToolResult);
    }

    // Generate notes if not provided
    const taskNotes =
      notes ||
      `- Start with a warm-up\n- Focus on proper form\n- End with cool-down`;

    // Build confirmation
    const previewData = {
      day: normalizedDay,
      timeRange,
      activity,
      notes: taskNotes,
    };

    const confirmMessage = buildConfirmationMessage("add_task", previewData);
    const preview = buildEditPreview("add_task", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "add_task",
        data: {
          day: normalizedDay,
          timeRange,
          activity,
          notes: taskNotes,
        },
        description: `Add "${activity}" on ${normalizedDay} at ${timeRange}`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "add_task",
    description: `Add a new task/activity to the user's wellness plan.

IMPORTANT RULES:
1. Always get plan context first to check for conflicts
2. Time range MUST be in format "H:MM AM - H:MM PM" (e.g., "7:00 AM - 8:00 AM")
3. If user gives vague time like "morning" or "afternoon", ask for specific time
4. Check for time conflicts before adding
5. Generate helpful notes for the activity (3 practical tips)
6. This tool returns a confirmation message - the task is NOT added until user confirms

Parameters:
- userId: The user's ID
- day: Day of the week (Monday-Sunday)
- timeRange: Time slot in format "H:MM AM - H:MM PM"
- activity: Name of the activity (e.g., "Morning Walk", "Yoga", "Meditation")
- notes: Optional practical tips for the activity (will be auto-generated if not provided)`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      day: z.string().describe("Day of the week (Monday-Sunday)"),
      timeRange: z
        .string()
        .describe('Time range in format "H:MM AM - H:MM PM"'),
      activity: z.string().describe("Name of the activity"),
      notes: z
        .string()
        .optional()
        .describe("Practical tips for the activity (markdown list)"),
    }),
  },
);

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getPlanFromDatabase } from "../../../utils/plan-retrieval";
import {
  validateRemoveDays,
  validateAddDaysOff,
  validateSwapDays,
  validateCopyDay,
  normalizeDayName,
} from "../../../utils/validation";
import {
  buildConfirmationMessage,
  buildEditPreview,
} from "../../../utils/preview";
import type { ToolResult } from "../../../types";

/**
 * Tool to remove days from the plan
 */
export const removeDaysTool = tool(
  async ({
    userId,
    daysToRemove,
  }: {
    userId: string;
    daysToRemove: string[];
  }): Promise<string> => {
    if (daysToRemove.length === 0) {
      return JSON.stringify({
        success: false,
        message:
          "Please specify which days you want to remove from your plan.\n\n" +
          'Example: "Remove Thursday and Friday from my plan"',
      } as ToolResult);
    }

    const validation = await validateRemoveDays(userId, daysToRemove);

    if (!validation.isValid) {
      let message = validation.errors.join(" ");

      if (validation.existingDays && validation.existingDays.length > 0) {
        message += `\n\nDays in your plan: ${validation.existingDays.join(", ")}`;
      }

      return JSON.stringify({
        success: false,
        message,
      } as ToolResult);
    }

    const previewData = {
      daysToRemove: validation.normalizedDays,
    };

    let confirmMessage = buildConfirmationMessage("remove_days", previewData);

    // Add note about ignored days
    if (validation.missingDays && validation.missingDays.length > 0) {
      confirmMessage = confirmMessage.replace(
        "[CONFIRM_BUTTON]",
        `Note: ${validation.missingDays.join(", ")} don't exist in your plan and will be ignored.\n\n[CONFIRM_BUTTON]`,
      );
    }

    const preview = buildEditPreview("remove_days", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "remove_days",
        data: { daysToRemove: validation.normalizedDays },
        description: `Remove ${validation.normalizedDays?.join(", ")} from plan`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "remove_days",
    description: `Remove specific days from the user's wellness plan. All tasks on those days will be permanently deleted.

IMPORTANT RULES:
1. Always get plan context first to see what days exist
2. Validate that the days actually exist in the plan
3. Cannot remove all days (plan would be empty)
4. Non-existent days are ignored with a note to user
5. This tool returns a confirmation message - days are NOT removed until user confirms

SPECIAL CASE - "Make my plan X days":
When user says "make my plan 3 days - Monday, Tuesday, Wednesday", this means:
- Keep only the specified days
- Remove all OTHER days that exist in the plan
- Use this tool to remove the days NOT mentioned by the user`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      daysToRemove: z
        .array(z.string())
        .describe(
          "Array of day names to remove (e.g., ['Thursday', 'Friday'])",
        ),
    }),
  },
);

/**
 * Tool to add days off
 */
export const addDaysOffTool = tool(
  async ({
    userId,
    daysToAdd,
  }: {
    userId: string;
    daysToAdd: string[];
  }): Promise<string> => {
    if (daysToAdd.length === 0) {
      return JSON.stringify({
        success: false,
        message:
          "Please specify which days you want to mark as days off.\n\n" +
          'Example: "Mark Saturday and Sunday as days off"',
      } as ToolResult);
    }

    const validation = await validateAddDaysOff(userId, daysToAdd);

    if (!validation.isValid) {
      return JSON.stringify({
        success: false,
        message: validation.errors.join(" "),
      } as ToolResult);
    }

    const previewData = { daysToAdd: validation.normalizedDays };
    const confirmMessage = buildConfirmationMessage(
      "add_days_off",
      previewData,
    );
    const preview = buildEditPreview("add_days_off", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "add_days_off",
        data: { daysToAdd: validation.normalizedDays },
        description: `Mark ${validation.normalizedDays?.join(", ")} as days off`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "add_days_off",
    description: `Mark specific days as days off (no tasks scheduled).

IMPORTANT RULES:
1. Days with existing tasks cannot be marked as days off (remove tasks first)
2. Valid day names required (Monday-Sunday)
3. This tool returns a confirmation message - changes are NOT applied until user confirms`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      daysToAdd: z
        .array(z.string())
        .describe(
          "Array of day names to mark as off (e.g., ['Saturday', 'Sunday'])",
        ),
    }),
  },
);

/**
 * Tool to swap tasks between two days
 */
export const swapDaysTool = tool(
  async ({
    userId,
    day1,
    day2,
  }: {
    userId: string;
    day1: string;
    day2: string;
  }): Promise<string> => {
    const validation = await validateSwapDays(userId, day1, day2);

    if (!validation.isValid) {
      return JSON.stringify({
        success: false,
        message: validation.errors.join(" "),
      } as ToolResult);
    }

    const [normalizedDay1, normalizedDay2] = validation.normalizedDays || [];

    const previewData = { day1: normalizedDay1, day2: normalizedDay2 };
    const confirmMessage = buildConfirmationMessage("swap_days", previewData);
    const preview = buildEditPreview("swap_days", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "swap_days",
        data: { day1: normalizedDay1, day2: normalizedDay2 },
        description: `Swap tasks between ${normalizedDay1} and ${normalizedDay2}`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "swap_days",
    description: `Swap all tasks between two days. Tasks from day1 move to day2 and vice versa.

IMPORTANT RULES:
1. Both days must have tasks to swap
2. Cannot swap a day with itself
3. Use this when user says "swap", "switch", "interchange", or "exchange" days
4. Also use when user mentions BOTH directions (e.g., "Monday to Tuesday and Tuesday to Monday")
5. This tool returns a confirmation message - swap is NOT executed until user confirms`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      day1: z.string().describe("First day to swap"),
      day2: z.string().describe("Second day to swap"),
    }),
  },
);

/**
 * Tool to copy tasks from one day to another
 */
export const copyDayTool = tool(
  async ({
    userId,
    sourceDay,
    targetDays,
  }: {
    userId: string;
    sourceDay: string;
    targetDays: string[];
  }): Promise<string> => {
    if (targetDays.length === 0) {
      return JSON.stringify({
        success: false,
        message:
          "Please specify which day(s) to copy to.\n\n" +
          'Example: "Copy Monday to Tuesday and Wednesday"',
      } as ToolResult);
    }

    const validation = await validateCopyDay(userId, sourceDay, targetDays);

    if (!validation.isValid) {
      return JSON.stringify({
        success: false,
        message: validation.errors.join(" "),
      } as ToolResult);
    }

    const [normalizedSource, ...normalizedTargets] =
      validation.normalizedDays || [];

    const previewData = {
      sourceDay: normalizedSource,
      targetDays: normalizedTargets,
    };

    let confirmMessage = buildConfirmationMessage("copy_day", previewData);

    // Warn about overwriting existing tasks
    if (validation.conflictingDays && validation.conflictingDays.length > 0) {
      confirmMessage = confirmMessage.replace(
        "Do you want to proceed?",
        `⚠️ **Warning:** ${validation.conflictingDays.join(", ")} already have tasks that will be replaced.\n\nDo you want to proceed?`,
      );
    }

    const preview = buildEditPreview("copy_day", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "copy_day",
        data: {
          sourceDay: normalizedSource,
          targetDays: normalizedTargets,
        },
        description: `Copy tasks from ${normalizedSource} to ${normalizedTargets.join(", ")}`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "copy_day",
    description: `Copy all tasks from one day to one or more other days.

IMPORTANT RULES:
1. Source day must have tasks to copy
2. Cannot copy a day to itself
3. Existing tasks on target days will be replaced
4. Multiple target days supported (e.g., copy Monday to Tuesday AND Wednesday)
5. Use this for "copy", "duplicate", "use X for Y", "same as" patterns
6. This tool returns a confirmation message - copy is NOT executed until user confirms`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      sourceDay: z.string().describe("Day to copy tasks FROM"),
      targetDays: z.array(z.string()).describe("Day(s) to copy tasks TO"),
    }),
  },
);

/**
 * Tool to rename/move a day (move all tasks to a different day)
 */
export const renameDayTool = tool(
  async ({
    userId,
    sourceDay,
    targetDay,
  }: {
    userId: string;
    sourceDay: string;
    targetDay: string;
  }): Promise<string> => {
    const normalizedSource = normalizeDayName(sourceDay);
    const normalizedTarget = normalizeDayName(targetDay);

    if (!normalizedSource || !normalizedTarget) {
      return JSON.stringify({
        success: false,
        message: `Invalid day name(s). Please use valid days (Monday-Sunday).`,
      } as ToolResult);
    }

    if (normalizedSource === normalizedTarget) {
      return JSON.stringify({
        success: false,
        message: "Cannot rename a day to itself.",
      } as ToolResult);
    }

    // Use copy validation to check source exists
    const validation = await validateCopyDay(userId, sourceDay, [targetDay]);

    if (!validation.isValid) {
      return JSON.stringify({
        success: false,
        message: validation.errors.join(" "),
      } as ToolResult);
    }

    const previewData = {
      sourceDay: normalizedSource,
      targetDay: normalizedTarget,
    };

    let confirmMessage = buildConfirmationMessage("rename_day", previewData);

    if (validation.conflictingDays && validation.conflictingDays.length > 0) {
      confirmMessage = confirmMessage.replace(
        "Do you want to proceed?",
        `⚠️ **Warning:** ${normalizedTarget} already has tasks that will be replaced.\n\nDo you want to proceed?`,
      );
    }

    const preview = buildEditPreview("rename_day", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "rename_day",
        data: {
          sourceDay: normalizedSource,
          targetDay: normalizedTarget,
        },
        description: `Move tasks from ${normalizedSource} to ${normalizedTarget}`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "rename_day",
    description: `Move all tasks from one day to another (like renaming the day). The source day will be empty after this operation.

IMPORTANT RULES:
1. Source day must have tasks
2. Cannot rename to the same day
3. Existing tasks on target day will be replaced
4. This is ONE-WAY only - if user wants both directions, use swap_days instead
5. Use this for "change X to Y", "rename X to Y", "move X to Y" (single direction)
6. This tool returns a confirmation message - move is NOT executed until user confirms`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      sourceDay: z
        .string()
        .describe("Day to move tasks FROM (will become empty)"),
      targetDay: z.string().describe("Day to move tasks TO"),
    }),
  },
);

/**
 * Tool to delete the entire plan
 */
export const deletePlanTool = tool(
  async ({ userId }: { userId: string }): Promise<string> => {
    const plan = await getPlanFromDatabase(userId);

    if (!plan) {
      return JSON.stringify({
        success: false,
        message: "You don't have a wellness plan to delete.",
      } as ToolResult);
    }

    const confirmMessage = buildConfirmationMessage("delete_plan", {});
    const preview = buildEditPreview("delete_plan", {});

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "delete_plan",
        data: { planId: plan.id },
        description: "Delete entire wellness plan",
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "delete_plan",
    description: `Delete the user's entire wellness plan. This is IRREVERSIBLE and removes all tasks, days off, and plan settings.

IMPORTANT RULES:
1. Only use when user explicitly asks to "delete entire plan", "remove everything", "start over", "clear all"
2. This is a DANGEROUS operation - warn user strongly
3. This tool returns a confirmation message - plan is NOT deleted until user confirms`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
    }),
  },
);

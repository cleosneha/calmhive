import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  normalizeDayName,
  findTaskInPlan,
  findTaskByPartialMatch,
  buildConfirmationMessage,
  buildEditPreview,
  getPlanContext,
} from "../../utils";
import type { ToolResult, PlanInfo, TaskInfo } from "../../types";

/**
 * Parse plan context into PlanInfo structure
 */
function parsePlanContext(context: string): PlanInfo | null {
  try {
    const lines = context.split("\n");
    const tasks: TaskInfo[] = [];
    const daysOff: string[] = [];
    let currentDay = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for day headers (Monday:, Tuesday:, etc.)
      const dayMatch = trimmed.match(
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):$/,
      );
      if (dayMatch) {
        currentDay = dayMatch[1];
        continue;
      }

      // Check for Days Off line
      if (trimmed.startsWith("Days Off:")) {
        const offDays = trimmed
          .replace("Days Off:", "")
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d);
        daysOff.push(...offDays);
        continue;
      }

      // Parse task lines (format: emoji time: activity)
      if (currentDay && trimmed.match(/^[✅🔄⬜]/)) {
        const taskMatch = trimmed.match(
          /^[✅🔄⬜]\s+([\d:]+\s*(?:AM|PM)\s*-\s*[\d:]+\s*(?:AM|PM)):\s+(.+?)(?:\s*\((.+?)\))?$/i,
        );
        if (taskMatch) {
          const [, timeRange, activity, notes] = taskMatch;
          tasks.push({
            id: tasks.length,
            day: currentDay,
            timeRange: timeRange.trim(),
            activity: activity.trim(),
            notes: notes?.trim() || null,
            status: trimmed.includes("✅")
              ? "done"
              : trimmed.includes("🔄")
                ? "partial"
                : "pending",
          });
        }
      }
    }

    return tasks.length > 0
      ? {
          id: 0,
          userId: "",
          daysOff,
          tasks,
        }
      : null;
  } catch (error) {
    console.error("Error parsing plan context:", error);
    return null;
  }
}

/**
 * Tool to modify an existing task
 */
export const modifyTaskTool = tool(
  async ({
    userId,
    day,
    oldActivity,
    newActivity,
    newNotes,
    newStatus,
    timeRange,
  }: {
    userId: string;
    day: string;
    oldActivity: string;
    newActivity?: string;
    newNotes?: string;
    newStatus?: "pending" | "done" | "partial";
    timeRange?: string;
  }): Promise<string> => {
    // Get plan context from embeddings
    const planContext = await getPlanContext(userId);
    if (!planContext) {
      return JSON.stringify({
        success: false,
        message: "You don't have a wellness plan yet.",
      } as ToolResult);
    }

    // Parse plan from context
    const plan = parsePlanContext(planContext);
    if (!plan || plan.tasks.length === 0) {
      return JSON.stringify({
        success: false,
        message: "Unable to parse your wellness plan. Please try again.",
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
    let task = findTaskInPlan(plan, normalizedDay, oldActivity, timeRange);

    if (!task) {
      task = findTaskByPartialMatch(plan, normalizedDay, oldActivity);
    }

    if (!task) {
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
          `I couldn't find "${oldActivity}" on ${normalizedDay}.\n\n` +
          `Here are the tasks on ${normalizedDay}:\n${taskList}\n\n` +
          `Please specify which task you want to modify.`,
      } as ToolResult);
    }

    // Determine modification type
    let modifyType: "title" | "notes" | "status" = "title";
    if (newStatus) {
      modifyType = "status";
    } else if (newNotes && !newActivity) {
      modifyType = "notes";
    }

    // Build confirmation
    const previewData = {
      day: task.day,
      timeRange: task.timeRange,
      oldActivity: task.activity,
      activity: newActivity || task.activity,
      notes: newNotes || task.notes || undefined,
      status: newStatus,
    };

    const confirmMessage = buildConfirmationMessage("modify_task", previewData);
    const preview = buildEditPreview("modify_task", previewData);

    return JSON.stringify({
      success: true,
      requiresConfirmation: true,
      pendingEdit: {
        type: "modify_task",
        data: {
          taskId: task.id,
          day: task.day,
          timeRange: task.timeRange,
          oldActivity: task.activity,
          activity: newActivity,
          notes: newNotes,
          status: newStatus,
          modifyType,
        },
        description: newStatus
          ? `Mark "${task.activity}" as ${newStatus}`
          : newActivity
            ? `Change "${task.activity}" to "${newActivity}"`
            : `Update notes for "${task.activity}"`,
        preview,
      },
      message: confirmMessage,
    } as ToolResult);
  },
  {
    name: "modify_task",
    description: `Modify an existing task in the user's wellness plan.

SUPPORTED MODIFICATIONS:
1. Change activity title/name (provide newActivity)
2. Update activity notes (provide newNotes)
3. Change task status (provide newStatus: "pending", "done", or "partial")

UNSUPPORTED (tell user these can't be done):
- Changing task time (need to remove and add new)
- Moving task to different day (need to remove and add new)

IMPORTANT RULES:
1. Always get plan context first to find the correct task
2. Match task by day and activity name
3. If task not found, list available tasks on that day
4. Only ONE type of modification at a time
5. This tool returns a confirmation message - changes are NOT applied until user confirms

Status mapping for user language:
- "done", "completed", "finished", "mark as done" → status: "done"
- "pending", "not done", "reset", "mark as pending" → status: "pending"
- "partial", "in progress", "half done" → status: "partial"`,
    schema: z.object({
      userId: z.string().describe("The user's ID"),
      day: z.string().describe("Day of the week (Monday-Sunday)"),
      oldActivity: z
        .string()
        .describe("Current name of the activity to modify"),
      newActivity: z
        .string()
        .optional()
        .describe("New name for the activity (if changing title)"),
      newNotes: z
        .string()
        .optional()
        .describe("New notes for the activity (if updating notes)"),
      newStatus: z
        .enum(["pending", "done", "partial"])
        .optional()
        .describe("New status (if changing status)"),
      timeRange: z
        .string()
        .optional()
        .describe("Time range to identify specific task"),
    }),
  },
);

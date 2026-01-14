import { z } from "zod";
import { tool } from "@langchain/core/tools";
import prisma from "@/lib/db";

/**
 * Tool: Add a new task to the user's plan
 */
export const addTaskTool = tool(
  async ({
    userId,
    day,
    timeRange,
    activity,
  }: {
    userId: string;
    day: string;
    timeRange: string;
    activity: string;
  }) => {
    try {
      // Find user's plan
      const plan = await prisma.plan.findFirst({
        where: { userId },
      });

      if (!plan) {
        return {
          success: false,
          error: "No plan found for this user",
        };
      }

      // Create new task
      const task = await prisma.task.create({
        data: {
          planId: plan.id,
          day,
          timeRange,
          activity,
          status: "pending",
        },
      });

      return {
        success: true,
        data: {
          taskId: task.id,
          message: `Added ${activity} on ${day} at ${timeRange}`,
        },
      };
    } catch (error) {
      console.error("Error adding task:", error);
      return {
        success: false,
        error: "Failed to add task to database",
      };
    }
  },
  {
    name: "add_task",
    description: "Add a new task to the user's weekly plan",
    schema: z.object({
      userId: z.string().describe("User ID"),
      day: z
        .string()
        .describe(
          "Day of the week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)"
        ),
      timeRange: z.string().describe("Time range (e.g., '6:00 AM - 7:00 AM')"),
      activity: z.string().describe("Activity name"),
    }),
  }
);

/**
 * Tool: Remove a task from the user's plan
 */
export const removeTaskTool = tool(
  async ({ userId, taskId }: { userId: string; taskId: number }) => {
    try {
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

      // Delete task
      await prisma.task.delete({
        where: { id: taskId },
      });

      return {
        success: true,
        data: {
          message: `Removed task: ${task.activity} on ${task.day}`,
        },
      };
    } catch (error) {
      console.error("Error removing task:", error);
      return {
        success: false,
        error: "Failed to remove task from database",
      };
    }
  },
  {
    name: "remove_task",
    description: "Remove a task from the user's weekly plan",
    schema: z.object({
      userId: z.string().describe("User ID"),
      taskId: z.number().describe("Task ID to remove"),
    }),
  }
);

/**
 * Tool: Modify an existing task in the user's plan
 */
export const modifyTaskTool = tool(
  async ({
    userId,
    taskId,
    day,
    timeRange,
    activity,
  }: {
    userId: string;
    taskId: number;
    day?: string;
    timeRange?: string;
    activity?: string;
  }) => {
    try {
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

      // Update task
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(day && { day }),
          ...(timeRange && { timeRange }),
          ...(activity && { activity }),
        },
      });

      return {
        success: true,
        data: {
          message: `Updated task on ${updated.day}: ${updated.activity}`,
        },
      };
    } catch (error) {
      console.error("Error modifying task:", error);
      return {
        success: false,
        error: "Failed to modify task in database",
      };
    }
  },
  {
    name: "modify_task",
    description: "Modify an existing task in the user's weekly plan",
    schema: z.object({
      userId: z.string().describe("User ID"),
      taskId: z.number().describe("Task ID to modify"),
      day: z.string().optional().describe("New day of the week (if changing)"),
      timeRange: z.string().optional().describe("New time range (if changing)"),
      activity: z
        .string()
        .optional()
        .describe("New activity name (if changing)"),
    }),
  }
);

/**
 * Tool: Update days off in the user's plan
 */
export const updateDaysOffTool = tool(
  async ({ userId, daysOff }: { userId: string; daysOff: string[] }) => {
    try {
      // Find user's plan
      const plan = await prisma.plan.findFirst({
        where: { userId },
      });

      if (!plan) {
        return {
          success: false,
          error: "No plan found for this user",
        };
      }

      // Update days off
      await prisma.plan.update({
        where: { id: plan.id },
        data: { daysOff },
      });

      return {
        success: true,
        data: {
          message: `Updated days off to: ${daysOff.join(", ")}`,
        },
      };
    } catch (error) {
      console.error("Error updating days off:", error);
      return {
        success: false,
        error: "Failed to update days off in database",
      };
    }
  },
  {
    name: "update_days_off",
    description: "Update the days off in the user's weekly plan",
    schema: z.object({
      userId: z.string().describe("User ID"),
      daysOff: z
        .array(z.string())
        .describe(
          "Array of days to mark as days off (e.g., ['Saturday', 'Sunday'])"
        ),
    }),
  }
);

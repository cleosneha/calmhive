"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";
import {
  getDurationFromTimeRange,
  calculateHoursSummaryFromTasks,
} from "@/utils/duration";

interface AddTaskInput {
  day: string;
  timeRange: string;
  activity: string;
  notes?: string | null;
  personalNotes?: string | null;
}

export interface AddTaskResult {
  success: boolean;
  message: string;
  data?: {
    taskId: number;
  };
}

/**
 * Add a new task to user's plan with conflict checking
 */
export async function addTask(input: AddTaskInput): Promise<AddTaskResult> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const { day, timeRange, activity, notes, personalNotes } = input;

    // Validate inputs
    if (!day || !timeRange || !activity) {
      return {
        success: false,
        message: "Day, time range, and activity are required",
      };
    }

    // Validate time range format and duration
    const duration = getDurationFromTimeRange(timeRange);
    if (duration === 0) {
      return {
        success: false,
        message:
          "Invalid time range format. Please use format like '7:00 AM - 8:00 AM' or '07:00 - 08:00'",
      };
    }

    if (duration < 0.25) {
      // Less than 15 minutes
      return {
        success: false,
        message: "Activity duration must be at least 15 minutes",
      };
    }

    if (duration > 8) {
      // More than 8 hours
      return {
        success: false,
        message: "Activity duration cannot exceed 8 hours",
      };
    }

    // Find user's plan
    const plan = await prisma.plan.findFirst({
      where: { userId: user.id },
      include: { tasks: true },
    });

    if (!plan) {
      return {
        success: false,
        message: "No plan found for this user",
      };
    }

    // Check for time conflicts
    const conflictingTask = plan.tasks.find(
      (task) =>
        task.day.toLowerCase() === day.toLowerCase() &&
        task.timeRange === timeRange,
    );

    if (conflictingTask) {
      return {
        success: false,
        message: `Time conflict: ${conflictingTask.activity} is already scheduled on ${day} at ${timeRange}. Please choose a different time.`,
      };
    }

    // Create new task
    const newTask = await prisma.task.create({
      data: {
        planId: plan.id,
        day,
        timeRange,
        activity,
        status: "pending",
        notes: notes || null,
        ...(personalNotes !== null && personalNotes !== undefined
          ? { personalNotes }
          : {}),
      },
    });

    // Get updated tasks for embedding and hours summary calculation
    const updatedPlan = await prisma.plan.findUnique({
      where: { id: plan.id },
      include: { tasks: true },
    });

    if (updatedPlan) {
      // Calculate and update hoursSummary
      const newHoursSummary = calculateHoursSummaryFromTasks(
        updatedPlan.tasks,
        updatedPlan.daysOff,
      );

      // Update plan with new hoursSummary
      await prisma.plan.update({
        where: { id: plan.id },
        data: { hoursSummary: newHoursSummary },
      });

      // Update embeddings
      await embedPlan(user.id, plan.id, updatedPlan.tasks, updatedPlan.daysOff);
    }

    return {
      success: true,
      message: `Added the task successfully.`,
      data: {
        taskId: newTask.id,
      },
    };
  } catch (error) {
    console.error("Error adding task:", error);
    return {
      success: false,
      message: "Failed to add task. Please try again.",
    };
  }
}

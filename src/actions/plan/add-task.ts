"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";

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
        task.timeRange === timeRange
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

    // Get updated tasks for embedding
    const updatedPlan = await prisma.plan.findUnique({
      where: { id: plan.id },
      include: { tasks: true },
    });

    if (updatedPlan) {
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

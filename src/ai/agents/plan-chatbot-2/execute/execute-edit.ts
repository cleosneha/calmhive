import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";
import { addTask } from "@/actions/plan/add-task";
import { removeTask } from "@/actions/plan/remove-task";
import { calculateHoursSummaryFromTasks } from "@/utils/duration";
import { normalizeTimeRange } from "../utils/time-parser";
import type { PendingEdit } from "../types";

interface ExecuteResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Execute a confirmed edit operation
 */
export async function executeEdit(
  userId: string,
  pendingEdit: PendingEdit,
): Promise<ExecuteResult> {
  try {
    const { type, data } = pendingEdit;

    switch (type) {
      case "add_task":
        return await executeAddTask(data);

      case "remove_task":
        return await executeRemoveTask(userId, data);

      case "modify_task":
        return await executeModifyTask(userId, data);

      case "add_days_off":
        return await executeAddDaysOff(userId, data);

      case "remove_days":
        return await executeRemoveDays(userId, data);

      case "copy_day":
        return await executeCopyDay(userId, data);

      case "swap_days":
        return await executeSwapDays(userId, data);

      case "rename_day":
        return await executeRenameDay(userId, data);

      case "delete_plan":
        return await executeDeletePlan(userId);

      default:
        return { success: false, error: "Unknown edit type" };
    }
  } catch (error) {
    console.error("[executeEdit] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function executeAddTask(
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { day, timeRange, activity, notes } = data as {
    day: string;
    timeRange: string;
    activity: string;
    notes?: string;
  };

  const result = await addTask({
    day,
    timeRange: normalizeTimeRange(timeRange),
    activity,
    notes: notes || null,
  });

  if (!result.success) {
    return { success: false, error: result.message };
  }

  return {
    success: true,
    message: `Added **${activity}** on **${day}** at **${timeRange}**.`,
  };
}

async function executeRemoveTask(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { taskId } = data as { taskId: number };

  const result = await removeTask({ taskId });

  if (!result.success) {
    return { success: false, error: result.message };
  }

  if (result.data?.planDeleted) {
    return {
      success: true,
      message:
        "Task removed and your plan has been deleted as it had no other tasks.",
    };
  }

  return { success: true, message: "Task removed successfully." };
}

async function executeModifyTask(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { taskId, activity, notes, status, modifyType } = data as {
    taskId: number;
    activity?: string;
    notes?: string;
    status?: string;
    modifyType?: string;
  };

  const updateData: Record<string, unknown> = {};

  if (modifyType === "status" && status) {
    updateData.status = status;
  } else if (modifyType === "notes" && notes) {
    updateData.notes = notes;
  } else if (modifyType === "title" && activity) {
    updateData.activity = activity;
    if (notes) updateData.notes = notes;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  // Re-embed the plan
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (plan) {
    await embedPlan(userId, plan.id, plan.tasks, plan.daysOff);
  }

  const action =
    modifyType === "status"
      ? `marked as ${status}`
      : modifyType === "notes"
        ? "notes updated"
        : `changed to "${activity}"`;

  return { success: true, message: `Task ${action}.` };
}

async function executeAddDaysOff(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { daysToAdd } = data as { daysToAdd: string[] };

  const plan = await prisma.plan.findFirst({ where: { userId } });
  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  const currentDaysOff = plan.daysOff || [];
  const newDaysOff = [...new Set([...currentDaysOff, ...daysToAdd])];

  await prisma.plan.update({
    where: { id: plan.id },
    data: { daysOff: newDaysOff },
  });

  // Re-fetch with tasks for embedding
  const updatedPlan = await prisma.plan.findFirst({
    where: { id: plan.id },
    include: { tasks: true },
  });

  if (updatedPlan) {
    await embedPlan(userId, updatedPlan.id, updatedPlan.tasks, newDaysOff);
  }

  return {
    success: true,
    message: `Marked **${daysToAdd.join(", ")}** as days off.`,
  };
}

async function executeRemoveDays(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { daysToRemove } = data as { daysToRemove: string[] };

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  // Delete tasks on those days
  await prisma.task.deleteMany({
    where: {
      planId: plan.id,
      day: { in: daysToRemove },
    },
  });

  // Get remaining tasks
  const remainingTasks = plan.tasks.filter(
    (t) => !daysToRemove.includes(t.day),
  );

  // Update hours summary
  const hoursSummary = calculateHoursSummaryFromTasks(
    remainingTasks,
    plan.daysOff,
  );

  await prisma.plan.update({
    where: { id: plan.id },
    data: { hoursSummary },
  });

  await embedPlan(userId, plan.id, remainingTasks, plan.daysOff);

  return {
    success: true,
    message: `Removed **${daysToRemove.join(", ")}** from your plan.`,
  };
}

async function executeCopyDay(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { sourceDay, targetDays } = data as {
    sourceDay: string;
    targetDays: string[];
  };

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  const sourceTasks = plan.tasks.filter((t) => t.day === sourceDay);

  if (sourceTasks.length === 0) {
    return { success: false, error: `No tasks found on ${sourceDay}` };
  }

  // For each target day
  for (const targetDay of targetDays) {
    // Delete existing tasks on target day
    await prisma.task.deleteMany({
      where: {
        planId: plan.id,
        day: targetDay,
      },
    });

    // Copy tasks from source
    for (const task of sourceTasks) {
      await prisma.task.create({
        data: {
          planId: plan.id,
          day: targetDay,
          timeRange: task.timeRange,
          activity: task.activity,
          notes: task.notes,
          status: "pending",
        },
      });
    }
  }

  // Update hours summary
  const updatedPlan = await prisma.plan.findFirst({
    where: { id: plan.id },
    include: { tasks: true },
  });

  if (updatedPlan) {
    const hoursSummary = calculateHoursSummaryFromTasks(
      updatedPlan.tasks,
      updatedPlan.daysOff,
    );

    await prisma.plan.update({
      where: { id: plan.id },
      data: { hoursSummary },
    });

    await embedPlan(userId, plan.id, updatedPlan.tasks, updatedPlan.daysOff);
  }

  return {
    success: true,
    message: `Copied tasks from **${sourceDay}** to **${targetDays.join(", ")}**.`,
  };
}

async function executeSwapDays(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { day1, day2 } = data as { day1: string; day2: string };

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  const day1Tasks = plan.tasks.filter((t) => t.day === day1);
  const day2Tasks = plan.tasks.filter((t) => t.day === day2);

  // Update day1 tasks to day2
  for (const task of day1Tasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { day: day2 },
    });
  }

  // Update day2 tasks to day1
  for (const task of day2Tasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { day: day1 },
    });
  }

  // Re-fetch plan with updated tasks
  const updatedPlan = await prisma.plan.findFirst({
    where: { id: plan.id },
    include: { tasks: true },
  });

  if (updatedPlan) {
    await embedPlan(
      userId,
      updatedPlan.id,
      updatedPlan.tasks,
      updatedPlan.daysOff,
    );
  }

  return {
    success: true,
    message: `Swapped tasks between **${day1}** and **${day2}**.`,
  };
}

async function executeRenameDay(
  userId: string,
  data: Record<string, unknown>,
): Promise<ExecuteResult> {
  const { sourceDay, targetDay } = data as {
    sourceDay: string;
    targetDay: string;
  };

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  // Delete existing tasks on target day
  await prisma.task.deleteMany({
    where: {
      planId: plan.id,
      day: targetDay,
    },
  });

  // Move source tasks to target
  await prisma.task.updateMany({
    where: {
      planId: plan.id,
      day: sourceDay,
    },
    data: { day: targetDay },
  });

  // Re-fetch plan with updated tasks
  const updatedPlan = await prisma.plan.findFirst({
    where: { id: plan.id },
    include: { tasks: true },
  });

  if (updatedPlan) {
    await embedPlan(
      userId,
      updatedPlan.id,
      updatedPlan.tasks,
      updatedPlan.daysOff,
    );
  }

  return {
    success: true,
    message: `Moved all tasks from **${sourceDay}** to **${targetDay}**.`,
  };
}

async function executeDeletePlan(userId: string): Promise<ExecuteResult> {
  const plan = await prisma.plan.findFirst({ where: { userId } });

  if (!plan) {
    return { success: false, error: "No plan found" };
  }

  // Delete all tasks first
  await prisma.task.deleteMany({
    where: { planId: plan.id },
  });

  // Delete the plan
  await prisma.plan.delete({
    where: { id: plan.id },
  });

  return {
    success: true,
    message:
      "Your wellness plan has been deleted. You can create a new one through the onboarding process.",
  };
}

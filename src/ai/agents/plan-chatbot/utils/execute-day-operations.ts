import prisma from "@/lib/db";
import { embedPlan } from "@/actions/plan/process-embedding";
import { calculateHoursSummaryFromTasks } from "@/utils/duration";

/**
 * Day operations execution utilities
 */

export interface DayOperationResult {
  success: boolean;
  message?: string;
  error?: string;
  previousData?: Record<string, unknown>;
}

/**
 * Add days off to the plan
 */
export async function executeAddDaysOff(
  userId: string,
  daysToAdd: string[],
): Promise<DayOperationResult> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found" };
    }

    // Store previous state
    const previousDaysOff = [...plan.daysOff];

    // Add new days off (avoid duplicates)
    const updatedDaysOff = [...new Set([...plan.daysOff, ...daysToAdd])];

    // Recalculate hours summary with new days off
    const newHoursSummary = calculateHoursSummaryFromTasks(
      plan.tasks,
      updatedDaysOff,
    );

    // Update plan
    await prisma.plan.update({
      where: { id: plan.id },
      data: { daysOff: updatedDaysOff, hoursSummary: newHoursSummary },
    });

    // Re-embed the plan
    await embedPlan(userId, plan.id, plan.tasks, updatedDaysOff);

    return {
      success: true,
      message: `Added ${daysToAdd.join(", ")} as days off. These days won't have any tasks.`,
      previousData: { daysOff: previousDaysOff },
    };
  } catch (error) {
    console.error("[executeAddDaysOff] Error:", error);
    return {
      success: false,
      error: "Failed to add days off. Please try again.",
    };
  }
}

/**
 * Remove days from the plan (delete all tasks on those days)
 */
export async function executeRemoveDays(
  userId: string,
  daysToRemove: string[],
): Promise<DayOperationResult> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found" };
    }

    // Store previous tasks for these days
    const removedTasks = plan.tasks.filter((task) =>
      daysToRemove.includes(task.day),
    );
    const previousData = {
      tasks: removedTasks.map((t) => ({
        id: t.id,
        day: t.day,
        timeRange: t.timeRange,
        activity: t.activity,
        notes: t.notes,
      })),
    };

    // Delete all tasks for these days
    await prisma.task.deleteMany({
      where: {
        planId: plan.id,
        day: { in: daysToRemove },
      },
    });

    // Recalculate hours summary
    const remainingTasks = plan.tasks.filter(
      (task) => !daysToRemove.includes(task.day),
    );
    const newHoursSummary = calculateHoursSummaryFromTasks(
      remainingTasks,
      plan.daysOff,
    );

    await prisma.plan.update({
      where: { id: plan.id },
      data: { hoursSummary: newHoursSummary },
    });

    // Re-embed the plan
    await embedPlan(userId, plan.id, remainingTasks, plan.daysOff);

    const taskCount = removedTasks.length;
    return {
      success: true,
      message: `Removed ${daysToRemove.join(", ")} from your plan (${taskCount} task${taskCount !== 1 ? "s" : ""} deleted).`,
      previousData,
    };
  } catch (error) {
    console.error("[executeRemoveDays] Error:", error);
    return {
      success: false,
      error: "Failed to remove days. Please try again.",
    };
  }
}

/**
 * Copy day plan to another day or multiple days
 */
export async function executeCopyDay(
  userId: string,
  sourceDay: string,
  targetDays: string | string[],
  deleteExisting: boolean = false,
  existingTargets: string[] = [],
): Promise<DayOperationResult> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found" };
    }

    // Normalize targetDays to array
    const targetDaysList = Array.isArray(targetDays)
      ? targetDays
      : [targetDays];

    // Get source tasks
    const sourceTasks = plan.tasks.filter((t) => t.day === sourceDay);

    // Store previous target tasks if any
    const previousTargetTasks = plan.tasks.filter((t) =>
      targetDaysList.includes(t.day),
    );
    const previousData =
      deleteExisting && previousTargetTasks.length > 0
        ? {
            deletedTasks: previousTargetTasks.map((t) => ({
              id: t.id,
              day: t.day,
              timeRange: t.timeRange,
              activity: t.activity,
              notes: t.notes,
            })),
          }
        : {};

    // Delete existing target tasks if they exist
    if (existingTargets.length > 0) {
      await prisma.task.deleteMany({
        where: {
          planId: plan.id,
          day: { in: existingTargets },
        },
      });
    }

    // Copy source tasks to all target days
    const tasksToCreate = targetDaysList.flatMap((targetDay) =>
      sourceTasks.map((task) => ({
        planId: plan.id,
        day: targetDay,
        timeRange: task.timeRange,
        activity: task.activity,
        notes: task.notes,
        status: "pending" as const,
      })),
    );

    await prisma.task.createMany({
      data: tasksToCreate,
    });

    // Recalculate hours summary
    const allTasks = await prisma.task.findMany({
      where: { planId: plan.id },
    });
    const newHoursSummary = calculateHoursSummaryFromTasks(
      allTasks,
      plan.daysOff,
    );

    await prisma.plan.update({
      where: { id: plan.id },
      data: { hoursSummary: newHoursSummary },
    });

    // Re-embed the plan
    await embedPlan(userId, plan.id, allTasks, plan.daysOff);

    const targetList = targetDaysList.join(", ");
    const action = existingTargets.length > 0 ? "replaced with" : "copied to";
    const totalCopied = sourceTasks.length * targetDaysList.length;

    return {
      success: true,
      message: `${sourceDay}'s plan has been ${action} ${targetList} (${totalCopied} task${totalCopied !== 1 ? "s" : ""} ${targetDaysList.length === 1 ? "copied" : "created"}).`,
      previousData,
    };
  } catch (error) {
    console.error("[executeCopyDay] Error:", error);
    return {
      success: false,
      error: "Failed to copy day plan. Please try again.",
    };
  }
}

/**
 * Rename a day (change day name for all tasks)
 */
export async function executeRenameDay(
  userId: string,
  oldDay: string,
  newDay: string,
  deleteExistingNew: boolean = false,
): Promise<DayOperationResult> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found" };
    }

    // Store tasks that will be affected
    const oldDayTasks = plan.tasks.filter((t) => t.day === oldDay);
    const newDayTasks = plan.tasks.filter((t) => t.day === newDay);

    const previousData: Record<string, unknown> = {
      oldDay,
      taskIds: oldDayTasks.map((t) => t.id),
    };

    // Delete existing tasks on new day if requested
    if (deleteExistingNew && newDayTasks.length > 0) {
      await prisma.task.deleteMany({
        where: {
          planId: plan.id,
          day: newDay,
        },
      });
      previousData.deletedTasks = newDayTasks.map((t) => ({
        id: t.id,
        day: t.day,
        timeRange: t.timeRange,
        activity: t.activity,
        notes: t.notes,
      }));
    }

    // Rename day for all tasks
    await prisma.task.updateMany({
      where: {
        planId: plan.id,
        day: oldDay,
      },
      data: { day: newDay },
    });

    // Recalculate hours summary
    const allTasks = await prisma.task.findMany({
      where: { planId: plan.id },
    });
    const newHoursSummary = calculateHoursSummaryFromTasks(
      allTasks,
      plan.daysOff,
    );

    await prisma.plan.update({
      where: { id: plan.id },
      data: { hoursSummary: newHoursSummary },
    });

    // Re-embed the plan
    await embedPlan(userId, plan.id, allTasks, plan.daysOff);

    const deletedInfo = deleteExistingNew
      ? ` The previous ${newDay} plan was deleted.`
      : "";
    return {
      success: true,
      message: `Changed ${oldDay} to ${newDay} (${oldDayTasks.length} task${oldDayTasks.length !== 1 ? "s" : ""} updated).${deletedInfo}`,
      previousData,
    };
  } catch (error) {
    console.error("[executeRenameDay] Error:", error);
    return {
      success: false,
      error: "Failed to rename day. Please try again.",
    };
  }
}

/**
 * Swap two days (interchange their plans)
 */
export async function executeSwapDays(
  userId: string,
  day1: string,
  day2: string,
): Promise<DayOperationResult> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { success: false, error: "No plan found" };
    }

    const day1Tasks = plan.tasks.filter((t) => t.day === day1);
    const day2Tasks = plan.tasks.filter((t) => t.day === day2);

    // Use a temporary day name to avoid conflicts
    const tempDay = "___TEMP___";

    // Step 1: Move day1 tasks to temp
    await prisma.task.updateMany({
      where: {
        planId: plan.id,
        day: day1,
      },
      data: { day: tempDay },
    });

    // Step 2: Move day2 tasks to day1
    await prisma.task.updateMany({
      where: {
        planId: plan.id,
        day: day2,
      },
      data: { day: day1 },
    });

    // Step 3: Move temp tasks to day2
    await prisma.task.updateMany({
      where: {
        planId: plan.id,
        day: tempDay,
      },
      data: { day: day2 },
    });

    // Recalculate hours summary (no change in total, but day distribution changes)
    const allTasks = await prisma.task.findMany({
      where: { planId: plan.id },
    });
    const newHoursSummary = calculateHoursSummaryFromTasks(
      allTasks,
      plan.daysOff,
    );

    await prisma.plan.update({
      where: { id: plan.id },
      data: { hoursSummary: newHoursSummary },
    });

    // Re-embed the plan
    await embedPlan(userId, plan.id, allTasks, plan.daysOff);

    return {
      success: true,
      message: `Swapped plans between ${day1} and ${day2} (${day1Tasks.length} ↔ ${day2Tasks.length} tasks).`,
      previousData: {
        day1Tasks: day1Tasks.map((t) => ({ id: t.id, day: day1 })),
        day2Tasks: day2Tasks.map((t) => ({ id: t.id, day: day2 })),
      },
    };
  } catch (error) {
    console.error("[executeSwapDays] Error:", error);
    return {
      success: false,
      error: "Failed to swap days. Please try again.",
    };
  }
}

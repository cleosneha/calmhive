import prisma from "@/lib/db";
import type { PlanInfo, TaskInfo } from "../types";

/**
 * Retrieve the user's plan from the database
 */
export async function getPlanFromDatabase(
  userId: string,
): Promise<PlanInfo | null> {
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) return null;

  return {
    id: plan.id,
    userId: plan.userId,
    daysOff: plan.daysOff,
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      day: task.day,
      timeRange: task.timeRange,
      activity: task.activity,
      notes: task.notes,
      status: task.status,
    })),
  };
}

/**
 * Format plan as readable text for context
 */
export function formatPlanAsContext(plan: PlanInfo): string {
  const lines: string[] = ["Current Wellness Plan:"];

  // Group tasks by day
  const tasksByDay = new Map<string, TaskInfo[]>();
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  for (const task of plan.tasks) {
    const existing = tasksByDay.get(task.day) || [];
    existing.push(task);
    tasksByDay.set(task.day, existing);
  }

  // Add days with tasks
  for (const day of dayOrder) {
    const tasks = tasksByDay.get(day);
    if (tasks && tasks.length > 0) {
      lines.push(`\n${day}:`);
      for (const task of tasks.sort((a, b) =>
        a.timeRange.localeCompare(b.timeRange),
      )) {
        const statusEmoji =
          task.status === "done"
            ? "✅"
            : task.status === "partial"
              ? "🔄"
              : "⬜";
        lines.push(
          `  ${statusEmoji} ${task.timeRange}: ${task.activity}${task.notes ? ` (${task.notes})` : ""}`,
        );
      }
    }
  }

  // Add days off
  if (plan.daysOff && plan.daysOff.length > 0) {
    lines.push(`\nDays Off: ${plan.daysOff.join(", ")}`);
  }

  // Add summary of existing days
  const existingDays = [...new Set(plan.tasks.map((t) => t.day))];
  lines.push(`\nDays with tasks: ${existingDays.join(", ")}`);

  return lines.join("\n");
}

/**
 * Get plan context for LLM
 */
export async function getPlanContext(userId: string): Promise<string | null> {
  const plan = await getPlanFromDatabase(userId);
  if (!plan) return null;
  return formatPlanAsContext(plan);
}

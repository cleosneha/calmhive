import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { PlanTask } from "../types";

/**
 * Tool: Check if plan contains tasks on user's days off
 * Ensures the plan respects user's rest days
 */
export const daysOffCheckerTool = tool(
  async ({ tasks, daysOff }: { tasks: PlanTask[]; daysOff: string[] }) => {
    const violations: string[] = [];
    const tasksOnDaysOff: PlanTask[] = [];

    // Check each task against days off
    tasks.forEach((task) => {
      if (daysOff.includes(task.day)) {
        violations.push(`${task.day}: ${task.activity} at ${task.timeRange}`);
        tasksOnDaysOff.push(task);
      }
    });

    return {
      violations,
      tasksOnDaysOff,
      isValid: violations.length === 0,
      summary:
        violations.length === 0
          ? "No tasks scheduled on days off"
          : `Found ${violations.length} tasks on days off: ${violations.join(
              ", "
            )}`,
    };
  },
  {
    name: "days_off_checker",
    description:
      "Check if any tasks are scheduled on user's days off. Returns violations if tasks are found on rest days.",
    schema: z.object({
      tasks: z.array(
        z.object({
          day: z.string(),
          timeRange: z.string(),
          activity: z.string(),
          duration: z.number(),
          notes: z.string().optional(),
        })
      ),
      daysOff: z.array(z.string()),
    }),
  }
);

/**
 * Utility: Filter out tasks on days off
 */
export function filterDaysOff(
  tasks: PlanTask[],
  daysOff: string[]
): PlanTask[] {
  return tasks.filter((task) => !daysOff.includes(task.day));
}

/**
 * Utility: Get available days (excluding days off)
 */
export function getAvailableDays(daysOff: string[]): string[] {
  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return allDays.filter((day) => !daysOff.includes(day));
}

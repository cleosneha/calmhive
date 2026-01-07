import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { PlanTask } from "../types";

/**
 * Tool: Calculate total time for each day and validate against available time
 * Ensures the plan doesn't exceed user's daily time availability
 */
export const timeCalculatorTool = tool(
  async ({
    tasks,
    maxHoursPerDay,
  }: {
    tasks: PlanTask[];
    maxHoursPerDay: number;
  }) => {
    const dailyTotals: Record<string, number> = {};
    const violations: string[] = [];

    // Calculate total hours for each day
    tasks.forEach((task) => {
      if (!dailyTotals[task.day]) {
        dailyTotals[task.day] = 0;
      }
      dailyTotals[task.day] += task.duration / 60; // Convert minutes to hours
    });

    // Check for violations
    Object.entries(dailyTotals).forEach(([day, hours]) => {
      if (hours > maxHoursPerDay) {
        violations.push(
          `${day}: ${hours.toFixed(
            1
          )} hours exceeds limit of ${maxHoursPerDay} hours`
        );
      }
    });

    return {
      dailyTotals,
      violations,
      isValid: violations.length === 0,
      summary: `Total hours per day: ${Object.entries(dailyTotals)
        .map(([day, hours]) => `${day}: ${hours.toFixed(1)}h`)
        .join(", ")}`,
    };
  },
  {
    name: "time_calculator",
    description:
      "Calculate total time allocated for each day and validate against user's available time. Returns daily totals and any time violations.",
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
      maxHoursPerDay: z.number(),
    }),
  }
);

/**
 * Utility: Parse time range to duration
 * Converts "09:00-10:00" to 60 (minutes)
 */
export function parseTimeRange(timeRange: string): number {
  const [start, end] = timeRange.split("-");
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  return endTotalMin - startTotalMin;
}

/**
 * Utility: Calculate total daily hours from tasks
 */
export function calculateDailyHours(tasks: PlanTask[]): Record<string, number> {
  const dailyTotals: Record<string, number> = {};

  tasks.forEach((task) => {
    if (!dailyTotals[task.day]) {
      dailyTotals[task.day] = 0;
    }
    dailyTotals[task.day] += task.duration / 60; // Convert minutes to hours
  });

  return dailyTotals;
}

/**
 * Utility: Calculate hours summary including daily totals and weekly total
 * Excludes days off from the calculation
 */
export function calculateHoursSummary(
  tasks: PlanTask[],
  daysOff: string[]
): Record<string, number> {
  const summary: Record<string, number> = {};
  let weekTotal = 0;

  // Calculate daily hours (excluding days off)
  tasks.forEach((task) => {
    if (!daysOff.includes(task.day)) {
      if (!summary[task.day]) {
        summary[task.day] = 0;
      }
      const hours = task.duration / 60; // Convert minutes to hours
      summary[task.day] += hours;
      weekTotal += hours;
    }
  });

  // Add weekly total
  summary.weekTotal = weekTotal;

  return summary;
}

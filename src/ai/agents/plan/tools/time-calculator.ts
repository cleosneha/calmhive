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

/**
 * Parse energetic time string to hour limits
 * Supports formats like "before 8AM", "before 8am", "before 20:00", "7AM-9AM", "7am-9am", "7:00-9:00"
 * Returns { startHour, endHour } in 24-hour format
 */
export function parseEnergeticTime(
  energeticTime: string
): { startHour: number; endHour: number } | null {
  if (!energeticTime || typeof energeticTime !== "string") {
    return null;
  }

  const normalized = energeticTime.toLowerCase().trim();

  // Pattern: "before XAM/XPM" or "before X:00"
  const beforeMatch = normalized.match(/before\s+(\d{1,2})(?::00)?\s*(am|pm)?/);
  if (beforeMatch) {
    let hour = parseInt(beforeMatch[1], 10);
    const period = beforeMatch[2];

    // Convert to 24-hour format
    if (period === "pm" && hour !== 12) {
      hour += 12;
    } else if (period === "am" && hour === 12) {
      hour = 0;
    }

    return { startHour: 0, endHour: hour };
  }

  // Pattern: "after XAM/XPM" or "after X:00"
  const afterMatch = normalized.match(/after\s+(\d{1,2})(?::00)?\s*(am|pm)?/);
  if (afterMatch) {
    let hour = parseInt(afterMatch[1], 10);
    const period = afterMatch[2];

    // Convert to 24-hour format
    if (period === "pm" && hour !== 12) {
      hour += 12;
    } else if (period === "am" && hour === 12) {
      hour = 0;
    }

    return { startHour: hour, endHour: 23 };
  }

  // Pattern: "XAM/XPM-YAM/YPM" or "X:00-Y:00"
  const rangeMatch = normalized.match(
    /(\d{1,2})(?::00)?\s*(am|pm)?\s*-\s*(\d{1,2})(?::00)?\s*(am|pm)?/
  );
  if (rangeMatch) {
    let startHour = parseInt(rangeMatch[1], 10);
    const startPeriod = rangeMatch[2];
    let endHour = parseInt(rangeMatch[3], 10);
    const endPeriod = rangeMatch[4];

    // Convert to 24-hour format
    if (startPeriod === "pm" && startHour !== 12) {
      startHour += 12;
    } else if (startPeriod === "am" && startHour === 12) {
      startHour = 0;
    }

    if (endPeriod === "pm" && endHour !== 12) {
      endHour += 12;
    } else if (endPeriod === "am" && endHour === 12) {
      endHour = 0;
    }

    return { startHour, endHour };
  }

  return null;
}

/**
 * Check if a time range (HH:MM-HH:MM) falls within the energetic time window
 */
export function isTimeWithinEnergeticWindow(
  timeRange: string,
  energeticTimeLimit: { startHour: number; endHour: number } | null
): boolean {
  if (!energeticTimeLimit) return true;

  const [start] = timeRange.split("-");
  const [startHour] = start.split(":").map(Number);

  // Check if activity starts within the energetic window
  return (
    startHour >= energeticTimeLimit.startHour &&
    startHour < energeticTimeLimit.endHour
  );
}

/**
 * Get end time from a time range
 */
export function getEndTime(timeRange: string): number {
  const [, end] = timeRange.split("-");
  const [endHour, endMin] = end.split(":").map(Number);
  return endHour + (endMin > 0 ? 0.5 : 0);
}

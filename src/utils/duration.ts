/**
 * Duration utilities (shared across app)
 * Move here from agent-specific utils so all consumers can reuse
 */

import type { Task } from "@prisma/client";

/**
 * Parse time range string (e.g., "10:00-11:00") and return duration in hours
 * @param timeRange - Time range string in format "HH:MM-HH:MM"
 * @returns Duration in hours (decimal)
 */
export function getDurationFromTimeRange(timeRange: string): number {
  try {
    const [start, end] = timeRange.split("-");
    if (!start || !end) {
      console.warn(`Invalid time range format: ${timeRange}`);
      return 0;
    }

    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    if (
      isNaN(startHour) ||
      isNaN(startMin) ||
      isNaN(endHour) ||
      isNaN(endMin)
    ) {
      console.warn(`Invalid time range values: ${timeRange}`);
      return 0;
    }

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    return (endTotalMin - startTotalMin) / 60; // Convert minutes to hours
  } catch (error) {
    console.error(`Error parsing time range ${timeRange}:`, error);
    return 0;
  }
}

/**
 * Calculate hours summary from tasks
 * Returns object with daily hours and weekly total
 * Excludes days off from calculation
 * @param tasks - Array of tasks
 * @param daysOff - Array of day names that are days off (e.g., ["Saturday", "Sunday"])
 * @returns Record with daily hours and weekTotal
 */
export function calculateHoursSummaryFromTasks(
  tasks: Task[],
  daysOff: string[] = []
): Record<string, number> {
  const summary: Record<string, number> = {};
  let weekTotal = 0;

  // Group tasks by day and sum durations
  const tasksByDay = new Map<string, number>();

  tasks.forEach((task) => {
    // Skip days off
    if (daysOff.includes(task.day)) {
      return;
    }

    const duration = getDurationFromTimeRange(task.timeRange);
    const currentTotal = tasksByDay.get(task.day) || 0;
    tasksByDay.set(task.day, currentTotal + duration);
  });

  // Convert to summary object and calculate week total
  tasksByDay.forEach((hours, day) => {
    summary[day] = Number(hours.toFixed(2)); // Round to 2 decimal places
    weekTotal += hours;
  });

  // Add weekly total
  summary.weekTotal = Number(weekTotal.toFixed(2));

  return summary;
}

/**
 * Update hours summary for a specific day
 * Useful when updating a single task's time
 * @param currentSummary - Current hours summary object
 * @param day - Day to update
 * @param newDayHours - New total hours for the day
 * @returns Updated hours summary
 */
export function updateHoursSummaryForDay(
  currentSummary: Record<string, number> | null,
  day: string,
  newDayHours: number
): Record<string, number> {
  const summary = currentSummary ? { ...currentSummary } : {};
  const oldDayHours = summary[day] || 0;

  // Update the day's hours
  summary[day] = Number(newDayHours.toFixed(2));

  // Update week total
  const currentWeekTotal = summary.weekTotal || 0;
  const weekTotal = currentWeekTotal - oldDayHours + newDayHours;
  summary.weekTotal = Number(weekTotal.toFixed(2));

  return summary;
}

/**
 * Duration utilities (shared across app)
 * Move here from agent-specific utils so all consumers can reuse
 */

import type { Task } from "@prisma/client";

/**
 * Parse time range string (e.g., "10:00-11:00" or "10:00 AM-11:00 AM") and return duration in hours
 * @param timeRange - Time range string in format "HH:MM-HH:MM" or "H:MM AM/PM - H:MM AM/PM"
 * @returns Duration in hours (decimal)
 */
export function getDurationFromTimeRange(timeRange: string): number {
  try {
    // Support both 12-hour (7:00 AM - 8:00 AM) and 24-hour (07:00 - 08:00) formats
    const time12HourPattern =
      /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const time24HourPattern = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;

    let startHour: number, startMin: number, endHour: number, endMin: number;

    if (time12HourPattern.test(timeRange)) {
      const match = time12HourPattern.exec(timeRange);
      if (!match) {
        // console.warn(`Invalid 12-hour time range format: ${timeRange}`);
        return 0;
      }

      const [, sh, sm, sp, eh, em, ep] = match;
      startHour = parseInt(sh);
      startMin = parseInt(sm);
      endHour = parseInt(eh);
      endMin = parseInt(em);

      // Convert to 24-hour format
      if (sp.toUpperCase() === "PM" && startHour !== 12) startHour += 12;
      if (sp.toUpperCase() === "AM" && startHour === 12) startHour = 0;
      if (ep.toUpperCase() === "PM" && endHour !== 12) endHour += 12;
      if (ep.toUpperCase() === "AM" && endHour === 12) endHour = 0;
    } else if (time24HourPattern.test(timeRange)) {
      const match = time24HourPattern.exec(timeRange);
      if (!match) {
        // console.warn(`Invalid 24-hour time range format: ${timeRange}`);
        return 0;
      }

      [, startHour, startMin, endHour, endMin] = match.map(Number);
    } else {
      // console.warn(`Unsupported time range format: ${timeRange}`);
      return 0;
    }

    // Validate ranges
    if (
      startHour < 0 ||
      startHour > 23 ||
      endHour < 0 ||
      endHour > 23 ||
      startMin < 0 ||
      startMin > 59 ||
      endMin < 0 ||
      endMin > 59
    ) {
      // console.warn(`Invalid time range values: ${timeRange}`);
      return 0;
    }

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (endTotalMin <= startTotalMin) {
      // console.warn(`End time must be after start time: ${timeRange}`);
      return 0;
    }

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
  daysOff: string[] = [],
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
  newDayHours: number,
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

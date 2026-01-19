/**
 * Calculate the start and end of a given week
 * Week runs from Sunday 00:00:00 to Saturday 23:59:59
 */
export function getWeekBounds(date: Date = new Date()): {
  weekStart: Date;
  weekEnd: Date;
} {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Start of week (Sunday at 00:00:00)
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // End of week (Saturday at 23:59:59)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

/**
 * Get the previous week's bounds
 */
export function getPreviousWeekBounds(currentWeekStart: Date): {
  weekStart: Date;
  weekEnd: Date;
} {
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);

  const previousWeekEnd = new Date(previousWeekStart);
  previousWeekEnd.setDate(previousWeekStart.getDate() + 6);
  previousWeekEnd.setHours(23, 59, 59, 999);

  return { weekStart: previousWeekStart, weekEnd: previousWeekEnd };
}

/**
 * Parse time range string (e.g., "10:00-11:30") and return duration in minutes
 */
export function parseTimeRangeDuration(timeRange: string): number {
  const [start, end] = timeRange.split("-");
  if (!start || !end) return 0;

  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
}

/**
 * Format week display (e.g., "Jan 12 - Jan 18, 2026")
 */
export function formatWeekDisplay(weekStart: Date, weekEnd: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const startStr = weekStart.toLocaleDateString("en-US", options);
  const endStr = weekEnd.toLocaleDateString("en-US", {
    ...options,
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

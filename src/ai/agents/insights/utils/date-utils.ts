/**
 * Calculate the start and end of a given week in UTC
 * Week runs from Sunday 00:00:00 UTC to Saturday 23:59:59 UTC
 * All dates stored in DB should use UTC for consistency across timezones
 */
export function getWeekBounds(date: Date = new Date()): {
  weekStart: Date;
  weekEnd: Date;
} {
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Start of week (Sunday at 00:00:00 UTC)
  const weekStart = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - dayOfWeek,
      0,
      0,
      0,
      0,
    ),
  );

  // End of week (Saturday at 23:59:59 UTC)
  const weekEnd = new Date(
    Date.UTC(
      weekStart.getUTCFullYear(),
      weekStart.getUTCMonth(),
      weekStart.getUTCDate() + 6,
      23,
      59,
      59,
      999,
    ),
  );

  return { weekStart, weekEnd };
}

/**
 * Get the previous week's bounds in UTC
 */
export function getPreviousWeekBounds(currentWeekStart: Date): {
  weekStart: Date;
  weekEnd: Date;
} {
  const previousWeekStart = new Date(
    Date.UTC(
      currentWeekStart.getUTCFullYear(),
      currentWeekStart.getUTCMonth(),
      currentWeekStart.getUTCDate() - 7,
      0,
      0,
      0,
      0,
    ),
  );

  const previousWeekEnd = new Date(
    Date.UTC(
      previousWeekStart.getUTCFullYear(),
      previousWeekStart.getUTCMonth(),
      previousWeekStart.getUTCDate() + 6,
      23,
      59,
      59,
      999,
    ),
  );

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

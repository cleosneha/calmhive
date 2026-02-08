/**
 * Insights Date Helper Utilities
 * Handles date calculations and formatting for insights filtering
 * All dates are stored in UTC in the database for consistency across timezones
 */

export type TimePeriod = "current-month" | "current-year" | number; // number for specific year

/**
 * Get the start and end date of a specific month in UTC
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

/**
 * Get the start and end date of a specific year in UTC
 */
export function getYearRange(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  return { start, end };
}

/**
 * Get all weeks in a given month with their date ranges in UTC
 * Returns array of {weekLabel, start, end}
 */
export function getWeeksInMonth(year: number, month: number) {
  const weeks: Array<{ weekLabel: string; start: Date; end: Date }> = [];
  const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const currentDate = new Date(monthStart);

  while (currentDate <= monthEnd) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    // Don't go beyond month end
    if (weekEnd > monthEnd) {
      weekEnd.setTime(monthEnd.getTime());
    }

    const startDay = weekStart.getUTCDate();
    const endDay = weekEnd.getUTCDate();
    const monthName = monthStart.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });

    weeks.push({
      weekLabel: `${startDay}-${endDay} ${monthName}`,
      start: new Date(weekStart),
      end: new Date(
        Date.UTC(
          weekEnd.getUTCFullYear(),
          weekEnd.getUTCMonth(),
          weekEnd.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      ),
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 7);
  }

  return weeks;
}

/**
 * Get month names for a year (Jan-Dec)
 */
export function getMonthsInYear() {
  return [
    { label: "Jan", month: 1 },
    { label: "Feb", month: 2 },
    { label: "Mar", month: 3 },
    { label: "Apr", month: 4 },
    { label: "May", month: 5 },
    { label: "Jun", month: 6 },
    { label: "Jul", month: 7 },
    { label: "Aug", month: 8 },
    { label: "Sep", month: 9 },
    { label: "Oct", month: 10 },
    { label: "Nov", month: 11 },
    { label: "Dec", month: 12 },
  ];
}

/**
 * Get current month and year in UTC
 */
export function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getUTCMonth() + 1, // 1-12
    year: now.getUTCFullYear(),
  };
}

/**
 * Get available years for dropdown (current year + last 5 years) in UTC
 */
export function getAvailableYears() {
  const currentYear = new Date().getUTCFullYear();
  const years: number[] = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }
  return years;
}

/**
 * Format week label for display (works with UTC dates from DB)
 * Display will be converted to user's timezone by browser automatically
 */
export function formatWeekLabel(startDate: Date, endDate: Date): string {
  const monthName = startDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${startDate.getUTCDate()}-${endDate.getUTCDate()} ${monthName}`;
}

/**
 * Check if a date falls within a week range (all in UTC)
 */
export function isDateInWeek(
  date: Date,
  weekStart: Date,
  weekEnd: Date,
): boolean {
  const checkDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const start = new Date(
    Date.UTC(
      weekStart.getUTCFullYear(),
      weekStart.getUTCMonth(),
      weekStart.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const end = new Date(
    Date.UTC(
      weekEnd.getUTCFullYear(),
      weekEnd.getUTCMonth(),
      weekEnd.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  return checkDate >= start && checkDate <= end;
}

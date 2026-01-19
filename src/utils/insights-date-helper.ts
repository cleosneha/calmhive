/**
 * Insights Date Helper Utilities
 * Handles date calculations and formatting for insights filtering
 */

export type TimePeriod = "current-month" | "current-year" | number; // number for specific year

/**
 * Get the start and end date of a specific month
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the start and end date of a specific year
 */
export function getYearRange(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get all weeks in a given month with their date ranges
 * Returns array of {weekLabel, start, end}
 */
export function getWeeksInMonth(year: number, month: number) {
  const weeks: Array<{ weekLabel: string; start: Date; end: Date }> = [];
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const currentDate = new Date(monthStart);

  while (currentDate <= monthEnd) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Don't go beyond month end
    if (weekEnd > monthEnd) {
      weekEnd.setTime(monthEnd.getTime());
    }

    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const monthName = monthStart.toLocaleDateString("en-US", {
      month: "short",
    });

    weeks.push({
      weekLabel: `${startDay}-${endDay} ${monthName}`,
      start: new Date(weekStart),
      end: new Date(weekEnd.setHours(23, 59, 59, 999)),
    });

    currentDate.setDate(currentDate.getDate() + 7);
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
 * Get current month and year
 */
export function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
  };
}

/**
 * Get available years for dropdown (current year + last 5 years)
 */
export function getAvailableYears() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }
  return years;
}

/**
 * Format week label for display
 */
export function formatWeekLabel(startDate: Date, endDate: Date): string {
  const monthName = startDate.toLocaleDateString("en-US", { month: "short" });
  return `${startDate.getDate()}-${endDate.getDate()} ${monthName}`;
}

/**
 * Check if a date falls within a week range
 */
export function isDateInWeek(
  date: Date,
  weekStart: Date,
  weekEnd: Date,
): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);

  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);

  return checkDate >= start && checkDate <= end;
}

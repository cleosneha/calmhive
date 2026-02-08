/**
 * Get today's date in UTC timezone
 * Returns a date object with time set to 00:00:00 UTC
 * Use this for DB operations to ensure consistency across timezones
 */
export function getTodayDateUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

/**
 * Get start of day in UTC for any date
 * @param date - Date to convert
 * @returns Date object at 00:00:00 UTC
 */
export function getStartOfDayUTC(date: Date): Date {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

/**
 * Get today's date in the system's local timezone (without UTC conversion)
 * Returns a date object with time set to 00:00:00
 */
export function getTodayDate(): Date {
  const now = new Date();
  // Create a new date with only year, month, day in local timezone
  // This ensures no UTC conversion happens
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Convert a Date object to YYYY-MM-DD string in local timezone
 */
export function dateToISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string and create a Date object in local timezone
 */
export function parseISOStringToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Get a date for a specific day of the week in the current week
 * @param dayName - Name of the day (e.g., "Monday", "Tuesday")
 * @returns Date object for that day at 00:00:00 in local timezone
 */
export function getDateForDayOfWeek(dayName: string): Date {
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayIndex = dayOrder.indexOf(dayName);
  if (dayIndex === -1) {
    throw new Error(`Invalid day name: ${dayName}`);
  }

  const today = getTodayDate();
  const currentDayIndex = today.getDay();
  const daysOffset = dayIndex - currentDayIndex;

  // Create a new date by calculating the offset days
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysOffset);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate;
}

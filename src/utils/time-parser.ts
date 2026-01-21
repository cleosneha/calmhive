/**
 * Parse energetic time from various formats to HH:MM-HH:MM format
 * Supports formats like: "06:00-10:00", "9AM-10AM", "06:00", "before 9AM"
 */
export function parseEnergeticTime(timeString: string | null): {
  from: string;
  to: string;
} | null {
  if (!timeString || typeof timeString !== "string") {
    return null;
  }

  const normalized = timeString.trim().toLowerCase();

  // Format: HH:MM-HH:MM (already in correct format)
  if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(normalized)) {
    const [from, to] = normalized.split("-");
    return { from, to };
  }

  // Format: before/around/after TIME (e.g., "before 9am", "around 6:30am")
  const timePatterns = [
    {
      pattern:
        /^(?:before|early|around|after)?\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?$/,
      handler: (match: RegExpMatchArray) => {
        const fromHour = parseInt(match[1], 10);
        const fromMin = match[2] ? parseInt(match[2], 10) : 0;
        const fromPeriod = match[3] || "am";
        const toHour = parseInt(match[4], 10);
        const toMin = match[5] ? parseInt(match[5], 10) : 0;
        const toPeriod = match[6] || "am";

        const from = convertTo24Hour(fromHour, fromMin, fromPeriod);
        const to = convertTo24Hour(toHour, toMin, toPeriod);
        return { from, to };
      },
    },
    {
      pattern: /^(?:before|early|around)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?$/,
      handler: (match: RegExpMatchArray) => {
        const hour = parseInt(match[1], 10);
        const min = match[2] ? parseInt(match[2], 10) : 0;
        const period = match[3] || "am";

        // Assume 3-4 hour window before the time
        const to = convertTo24Hour(hour, min, period);
        const fromHour = Math.max(0, hour - 3);
        const from = convertTo24Hour(fromHour, 0, "am");
        return { from, to };
      },
    },
  ];

  for (const { pattern, handler } of timePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      return handler(match);
    }
  }

  return null;
}

/**
 * Convert 12-hour format to 24-hour format HH:MM
 */
function convertTo24Hour(
  hour: number,
  minute: number = 0,
  period: string = "am",
): string {
  let h = hour;

  if (period === "pm" && h !== 12) {
    h += 12;
  } else if (period === "am" && h === 12) {
    h = 0;
  }

  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Convert hours to minutes for storage
 */
export function hoursToMinutes(hours: number | string): number {
  const h = typeof hours === "string" ? parseFloat(hours) : hours;
  return Math.round(h * 60);
}

/**
 * Convert minutes to hours for display
 */
export function minutesToHours(minutes: number | string): string {
  const m = typeof minutes === "string" ? parseInt(minutes, 10) : minutes;
  const hours = m / 60;
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
}

/**
 * Convert HH:MM time format to minutes
 */
export function timeFormatToMinutes(timeString: string): number | null {
  if (!timeString || typeof timeString !== "string") {
    return null;
  }

  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Convert minutes to HH:MM time format
 */
export function minutesToTimeFormat(minutes: number | string): string {
  const m = typeof minutes === "string" ? parseInt(minutes, 10) : minutes;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

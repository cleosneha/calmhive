/**
 * Time parsing utilities for plan-chatbot-2
 */

/**
 * Convert a single time string to 24-hour format
 */
export function convertTo24Hour(time: string): string | null {
  try {
    const time12HourPattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const time24HourPattern = /^(\d{1,2}):(\d{2})$/;

    let hour: number, minute: number;

    if (time12HourPattern.test(time)) {
      const match = time.match(time12HourPattern);
      if (!match) return null;

      const [, h, m, period] = match;
      hour = parseInt(h, 10);
      minute = parseInt(m, 10);

      if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    } else if (time24HourPattern.test(time)) {
      const match = time.match(time24HourPattern);
      if (!match) return null;

      hour = parseInt(match[1], 10);
      minute = parseInt(match[2], 10);
    } else {
      return null;
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  } catch {
    return null;
  }
}

/**
 * Normalize time range to 24-hour format
 */
export function normalizeTimeRange(timeRange: string): string {
  let normalized = timeRange.replace(/\s+/g, " ").trim();

  if (normalized.includes("AM") || normalized.includes("PM")) {
    const parts = normalized.split(/\s*-\s*/);
    if (parts.length === 2) {
      const start = convertTo24Hour(parts[0].trim());
      const end = convertTo24Hour(parts[1].trim());
      if (start && end) {
        return `${start}-${end}`;
      }
    }
  }

  normalized = normalized.replace(/\s*-\s*/g, "-");
  return normalized;
}

/**
 * Parse time range to start/end minutes from midnight
 */
export function parseTimeRange(
  timeRange: string,
): { startMinutes: number; endMinutes: number } | null {
  try {
    const normalized = normalizeTimeRange(timeRange);
    const [startStr, endStr] = normalized.split("-");

    if (!startStr || !endStr) return null;

    const parseMinutes = (str: string): number | null => {
      const time = convertTo24Hour(str.trim()) || str.trim();
      const match = time.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return null;
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    };

    const startMinutes = parseMinutes(startStr);
    const endMinutes = parseMinutes(endStr);

    if (startMinutes === null || endMinutes === null) return null;

    return { startMinutes, endMinutes };
  } catch {
    return null;
  }
}

/**
 * Check if a time description is vague
 */
export function isVagueTime(timeInput: string): boolean {
  const vagueTerms = [
    "morning",
    "afternoon",
    "evening",
    "night",
    "early",
    "late",
    "noon",
    "midnight",
    "sometime",
    "around",
    "about",
    "before",
    "after",
  ];

  const lowerInput = timeInput.toLowerCase();
  return vagueTerms.some((term) => lowerInput.includes(term));
}

/**
 * Get time slot suggestion based on vague time
 */
export function getTimeSlotSuggestion(vagueTime: string): string {
  const lower = vagueTime.toLowerCase();

  if (lower.includes("morning") || lower.includes("early")) {
    return "6:00 AM - 7:00 AM";
  }
  if (lower.includes("noon") || lower.includes("lunch")) {
    return "12:00 PM - 1:00 PM";
  }
  if (lower.includes("afternoon")) {
    return "2:00 PM - 3:00 PM";
  }
  if (lower.includes("evening")) {
    return "6:00 PM - 7:00 PM";
  }
  if (lower.includes("night") || lower.includes("late")) {
    return "9:00 PM - 10:00 PM";
  }

  return "Please specify a time like '7:00 AM - 8:00 AM'";
}

/**
 * Format time range for display (12-hour format)
 */
export function formatTimeRangeDisplay(timeRange: string): string {
  const parsed = parseTimeRange(timeRange);
  if (!parsed) return timeRange;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  return `${formatTime(parsed.startMinutes)} - ${formatTime(parsed.endMinutes)}`;
}

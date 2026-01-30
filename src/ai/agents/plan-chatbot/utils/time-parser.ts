/**
 * Shared time parsing utilities for plan chatbot
 * Handles conversion between 12-hour and 24-hour formats
 */

/**
 * Convert a single time string to 24-hour format
 * Input: "7:00 AM", "7:30 PM", "07:00", "19:30"
 * Output: "07:00", "19:30"
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

      // Convert to 24-hour format
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

    // Validate ranges
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("[convertTo24Hour] Error:", error);
    return null;
  }
}

/**
 * Normalize time range string for consistent comparison
 * Converts to 24-hour format like "08:00-08:30"
 */
export function normalizeTimeRange(timeRange: string): string {
  // Remove extra spaces and standardize
  let normalized = timeRange.replace(/\s+/g, " ").trim();

  // If it contains AM/PM, convert to 24-hour
  if (normalized.includes("AM") || normalized.includes("PM")) {
    // Split by ' - ' or similar
    const parts = normalized.split(/\s*-\s*/);
    if (parts.length === 2) {
      const start = convertTo24Hour(parts[0].trim());
      const end = convertTo24Hour(parts[1].trim());
      if (start && end) {
        return `${start}-${end}`;
      }
    }
  }

  // If already in 24-hour format like "08:00-08:30", clean it
  normalized = normalized.replace(/\s*-\s*/g, "-");
  return normalized;
}

/**
 * Parse time range and return start/end times in minutes from midnight
 * Input: "7:00 AM - 8:00 AM" or "07:00 - 08:00"
 * Output: { startMinutes: 420, endMinutes: 480 } (7:00 = 420 minutes, 8:00 = 480 minutes)
 */
export function parseTimeRange(
  timeRange: string,
): { startMinutes: number; endMinutes: number } | null {
  try {
    const normalized = normalizeTimeRange(timeRange);
    const [startStr, endStr] = normalized.split("-");

    if (!startStr || !endStr) return null;

    const startTime = convertTo24Hour(startStr.trim());
    const endTime = convertTo24Hour(endStr.trim());

    if (!startTime || !endTime) return null;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return { startMinutes, endMinutes };
  } catch (error) {
    console.error("[parseTimeRange] Error:", error);
    return null;
  }
}

/**
 * Check if two time ranges overlap
 * Input: "07:00-08:00", "07:30-09:00"
 * Output: true (they overlap)
 */
export function doTimeRangesOverlap(range1: string, range2: string): boolean {
  try {
    const parsed1 = parseTimeRange(range1);
    const parsed2 = parseTimeRange(range2);

    if (!parsed1 || !parsed2) {
      console.error("[doTimeRangesOverlap] Invalid time format");
      return false;
    }

    const { startMinutes: start1, endMinutes: end1 } = parsed1;
    const { startMinutes: start2, endMinutes: end2 } = parsed2;

    // Two ranges overlap if: (start1 < end2) AND (start2 < end1)
    return start1 < end2 && start2 < end1;
  } catch (error) {
    console.error("[doTimeRangesOverlap] Error:", error);
    return false;
  }
}

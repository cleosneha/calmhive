import prisma from "@/lib/db";

/**
 * Parse time range to minutes from midnight
 */
function parseTimeToMinutes(time: string): number | null {
  try {
    // Match formats like "7:00 AM", "7:30 PM", "07:00", "19:30"
    const time12HourPattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const time24HourPattern = /^(\d{1,2}):(\d{2})$/;

    let hour: number, minute: number;

    if (time12HourPattern.test(time)) {
      const match = time.match(time12HourPattern);
      if (!match) return null;

      const [, h, m, period] = match;
      hour = parseInt(h);
      minute = parseInt(m);

      // Convert to 24-hour format
      if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
      if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    } else if (time24HourPattern.test(time)) {
      const match = time.match(time24HourPattern);
      if (!match) return null;

      hour = parseInt(match[1]);
      minute = parseInt(match[2]);
    } else {
      return null;
    }

    return hour * 60 + minute;
  } catch (error) {
    console.error("[parseTimeToMinutes] Error:", error);
    return null;
  }
}

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(range1: string, range2: string): boolean {
  try {
    // Split ranges into start and end times
    const [start1Str, end1Str] = range1.split("-").map((t) => t.trim());
    const [start2Str, end2Str] = range2.split("-").map((t) => t.trim());

    const start1 = parseTimeToMinutes(start1Str);
    const end1 = parseTimeToMinutes(end1Str);
    const start2 = parseTimeToMinutes(start2Str);
    const end2 = parseTimeToMinutes(end2Str);

    if (start1 === null || end1 === null || start2 === null || end2 === null) {
      console.error("[doTimeRangesOverlap] Invalid time format");
      return false;
    }

    // Two ranges overlap if:
    // (start1 < end2) AND (start2 < end1)
    return start1 < end2 && start2 < end1;
  } catch (error) {
    console.error("[doTimeRangesOverlap] Error:", error);
    return false;
  }
}

/**
 * Check if there's a time conflict for the given day and time
 * Now checks for overlapping time ranges, not just exact matches
 */
export async function checkTimeConflict(
  userId: string,
  day: string,
  timeRange: string,
  excludeActivity?: string,
): Promise<{
  hasConflict: boolean;
  conflictingActivity?: string;
  conflictingTime?: string;
}> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      include: { tasks: true },
    });

    if (!plan) {
      return { hasConflict: false };
    }

    // Check for overlapping time conflicts
    const conflictingTask = plan.tasks.find(
      (task) =>
        task.day.toLowerCase() === day.toLowerCase() &&
        doTimeRangesOverlap(task.timeRange, timeRange) &&
        (!excludeActivity ||
          task.activity.toLowerCase() !== excludeActivity.toLowerCase()),
    );

    if (conflictingTask) {
      return {
        hasConflict: true,
        conflictingActivity: conflictingTask.activity,
        conflictingTime: conflictingTask.timeRange,
      };
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("[checkTimeConflict] Error:", error);
    return { hasConflict: false };
  }
}

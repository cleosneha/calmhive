/**
 * Validation utilities for plan chatbot add task operations
 */

import prisma from "@/lib/db";

/**
 * Validate time range format (HH:MM AM/PM - HH:MM AM/PM or HH:MM - HH:MM)
 */
export function validateTimeRange(timeRange: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Support both 12-hour (7:00 AM - 8:00 AM) and 24-hour (07:00 - 08:00) formats
    const time12HourPattern =
      /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const time24HourPattern = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;

    let startHour: number, startMin: number, endHour: number, endMin: number;

    if (time12HourPattern.test(timeRange)) {
      const match = timeRange.match(time12HourPattern);
      if (!match) return { isValid: false, error: "Invalid time format" };

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
      const match = timeRange.match(time24HourPattern);
      if (!match) return { isValid: false, error: "Invalid time format" };

      [, startHour, startMin, endHour, endMin] = match.map(Number);
    } else {
      return {
        isValid: false,
        error:
          "Invalid time format. Use format like '7:00 AM - 8:00 AM' or '07:00 - 08:00'",
      };
    }

    // Validate hour and minute ranges
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
      return { isValid: false, error: "Invalid hour or minute values" };
    }

    // Calculate duration
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (endTotalMin <= startTotalMin) {
      return {
        isValid: false,
        error: "End time must be after start time",
      };
    }

    const durationMin = endTotalMin - startTotalMin;

    // Minimum 15 minutes, maximum 8 hours
    if (durationMin < 15) {
      return {
        isValid: false,
        error: "Activity duration must be at least 15 minutes",
      };
    }

    if (durationMin > 480) {
      // 8 hours
      return {
        isValid: false,
        error: "Activity duration cannot exceed 8 hours",
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating time range:", error);
    return { isValid: false, error: "Failed to validate time range" };
  }
}

/**
 * Validate day name
 */
export function validateDay(day: string): {
  isValid: boolean;
  normalizedDay?: string;
  error?: string;
} {
  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const normalizedDay = validDays.find(
    (d) => d.toLowerCase() === day.toLowerCase()
  );

  if (!normalizedDay) {
    return {
      isValid: false,
      error: `Invalid day. Must be one of: ${validDays.join(", ")}`,
    };
  }

  return { isValid: true, normalizedDay };
}

/**
 * Validate activity title (relevant and safe)
 */
export function validateActivityTitle(activity: string): {
  isValid: boolean;
  error?: string;
} {
  // Basic validation
  if (!activity || activity.trim().length < 2) {
    return {
      isValid: false,
      error: "Activity title must be at least 2 characters long",
    };
  }

  if (activity.length > 200) {
    return {
      isValid: false,
      error: "Activity title must not exceed 200 characters",
    };
  }

  // Check for inappropriate content (basic checks - LLM does deeper safety check)
  const inappropriatePatterns = [
    /\b(kill|suicide|harm|violence|abuse|drug)\b/i,
    /<script/i, // XSS attempt
    /javascript:/i,
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(activity)) {
      return {
        isValid: false,
        error: "Activity contains inappropriate or unsafe content",
      };
    }
  }

  return { isValid: true };
}

/**
 * Check if user's plan has a day off
 */
export async function checkIfDayOff(
  userId: string,
  day: string
): Promise<{
  isDayOff: boolean;
  error?: string;
}> {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId },
      select: { daysOff: true },
    });

    if (!plan) {
      return { isDayOff: false, error: "No plan found" };
    }

    const isDayOff = plan.daysOff.some(
      (d) => d.toLowerCase() === day.toLowerCase()
    );

    return { isDayOff };
  } catch (error) {
    console.error("Error checking day off:", error);
    return { isDayOff: false, error: "Failed to check day off" };
  }
}

/**
 * Comprehensive validation for add task operation
 */
export async function validateAddTask(
  userId: string,
  day: string,
  timeRange: string,
  activity: string
): Promise<{
  isValid: boolean;
  errors: string[];
  normalizedDay?: string;
}> {
  const errors: string[] = [];

  // Validate day
  const dayValidation = validateDay(day);
  if (!dayValidation.isValid) {
    errors.push(dayValidation.error || "Invalid day");
  }

  // Validate time range
  const timeValidation = validateTimeRange(timeRange);
  if (!timeValidation.isValid) {
    errors.push(timeValidation.error || "Invalid time range");
  }

  // Validate activity
  const activityValidation = validateActivityTitle(activity);
  if (!activityValidation.isValid) {
    errors.push(activityValidation.error || "Invalid activity title");
  }

  // Check if it's a day off
  if (dayValidation.isValid && dayValidation.normalizedDay) {
    const dayOffCheck = await checkIfDayOff(
      userId,
      dayValidation.normalizedDay
    );
    if (dayOffCheck.isDayOff) {
      errors.push(
        `Cannot add task on ${dayValidation.normalizedDay} as it's marked as a day off`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedDay: dayValidation.normalizedDay,
  };
}

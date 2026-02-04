import prisma from "@/lib/db";
import type { ValidationResult, PlanInfo, TaskInfo } from "../types";

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Normalize day name to proper case
 */
export function normalizeDayName(day: string): string | null {
  const normalized = day.trim().toLowerCase();
  if (VALID_DAYS.includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return null;
}

/**
 * Normalize time range to consistent format
 */
export function normalizeTimeRange(timeRange: string): string {
  return timeRange
    .replace(/\s+/g, " ")
    .replace(/(\d{1,2}):(\d{2})\s*(am|pm)/gi, (_, h, m, ampm) => {
      return `${h}:${m} ${ampm.toUpperCase()}`;
    })
    .trim();
}

/**
 * Parse time range into minutes for comparison
 */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(range1: string, range2: string): boolean {
  const parseRange = (range: string) => {
    const parts = range.split("-").map((t) => t.trim());
    if (parts.length !== 2) return null;
    return {
      start: parseTimeToMinutes(parts[0]),
      end: parseTimeToMinutes(parts[1]),
    };
  };

  const r1 = parseRange(range1);
  const r2 = parseRange(range2);

  if (!r1 || !r2) return false;

  return r1.start < r2.end && r2.start < r1.end;
}

/**
 * Validate that a task exists in the plan
 */
export function findTaskInPlan(
  plan: PlanInfo,
  day: string,
  activity: string,
  timeRange?: string,
): TaskInfo | null {
  const normalizedDay = normalizeDayName(day);
  if (!normalizedDay) return null;

  return (
    plan.tasks.find((task) => {
      const dayMatch = task.day.toLowerCase() === normalizedDay.toLowerCase();
      const activityMatch =
        task.activity.toLowerCase() === activity.toLowerCase();

      if (timeRange) {
        const timeMatch =
          normalizeTimeRange(task.timeRange) === normalizeTimeRange(timeRange);
        return dayMatch && activityMatch && timeMatch;
      }

      return dayMatch && activityMatch;
    }) || null
  );
}

/**
 * Find task by partial activity name match
 */
export function findTaskByPartialMatch(
  plan: PlanInfo,
  day: string,
  partialActivity: string,
): TaskInfo | null {
  const normalizedDay = normalizeDayName(day);
  if (!normalizedDay) return null;

  return (
    plan.tasks.find((task) => {
      const dayMatch = task.day.toLowerCase() === normalizedDay.toLowerCase();
      const activityMatch = task.activity
        .toLowerCase()
        .includes(partialActivity.toLowerCase());
      return dayMatch && activityMatch;
    }) || null
  );
}

/**
 * Validate days for removal
 */
export async function validateRemoveDays(
  userId: string,
  daysToRemove: string[],
): Promise<ValidationResult> {
  const errors: string[] = [];
  const normalizedDays: string[] = [];

  // Normalize and validate day names
  for (const day of daysToRemove) {
    const normalized = normalizeDayName(day);
    if (!normalized) {
      errors.push(`Invalid day name: "${day}"`);
    } else {
      normalizedDays.push(normalized);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Check if plan exists
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { isValid: false, errors: ["You don't have a plan yet."] };
  }

  // Check which days actually exist in the plan
  const existingDays = [...new Set(plan.tasks.map((task) => task.day))];
  const missingDays = normalizedDays.filter(
    (day) => !existingDays.includes(day),
  );

  // Filter to only existing days
  const validDaysToRemove = normalizedDays.filter(
    (day) => !missingDays.includes(day),
  );

  // Check if removing would leave plan empty
  const remainingDays = existingDays.filter(
    (day) => !validDaysToRemove.includes(day),
  );

  if (remainingDays.length === 0) {
    return {
      isValid: false,
      errors: [
        "Cannot remove all days from your plan. Your plan would be empty.",
      ],
    };
  }

  if (validDaysToRemove.length === 0) {
    return {
      isValid: false,
      errors: ["No valid days to remove from your plan."],
    };
  }

  return {
    isValid: true,
    errors: [],
    normalizedDays: validDaysToRemove,
    existingDays,
    missingDays,
  };
}

/**
 * Validate days for adding as days off
 */
export async function validateAddDaysOff(
  userId: string,
  daysToAdd: string[],
): Promise<ValidationResult> {
  const errors: string[] = [];
  const normalizedDays: string[] = [];

  for (const day of daysToAdd) {
    const normalized = normalizeDayName(day);
    if (!normalized) {
      errors.push(`Invalid day name: "${day}"`);
    } else {
      normalizedDays.push(normalized);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { isValid: false, errors: ["You don't have a plan yet."] };
  }

  // Check for conflicts with existing tasks
  const conflictingDays: string[] = [];
  for (const day of normalizedDays) {
    const hasTasksOnDay = plan.tasks.some((task) => task.day === day);
    if (hasTasksOnDay) {
      conflictingDays.push(day);
    }
  }

  if (conflictingDays.length > 0) {
    return {
      isValid: false,
      errors: [
        `These days have tasks and cannot be marked as days off: ${conflictingDays.join(", ")}. Remove the tasks first.`,
      ],
      conflictingDays,
    };
  }

  return {
    isValid: true,
    errors: [],
    normalizedDays,
  };
}

/**
 * Validate swap days operation
 */
export async function validateSwapDays(
  userId: string,
  day1: string,
  day2: string,
): Promise<ValidationResult> {
  const normalized1 = normalizeDayName(day1);
  const normalized2 = normalizeDayName(day2);

  if (!normalized1 || !normalized2) {
    return {
      isValid: false,
      errors: [
        `Invalid day name(s): ${!normalized1 ? day1 : ""} ${!normalized2 ? day2 : ""}`.trim(),
      ],
    };
  }

  if (normalized1 === normalized2) {
    return {
      isValid: false,
      errors: ["Cannot swap a day with itself."],
    };
  }

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { isValid: false, errors: ["You don't have a plan yet."] };
  }

  const existingDays = [...new Set(plan.tasks.map((task) => task.day))];
  const missingDays: string[] = [];

  if (!existingDays.includes(normalized1)) missingDays.push(normalized1);
  if (!existingDays.includes(normalized2)) missingDays.push(normalized2);

  if (missingDays.length > 0) {
    return {
      isValid: false,
      errors: [`These days don't have any tasks: ${missingDays.join(", ")}`],
      missingDays,
    };
  }

  return {
    isValid: true,
    errors: [],
    normalizedDays: [normalized1, normalized2],
    existingDays,
  };
}

/**
 * Validate copy day operation
 */
export async function validateCopyDay(
  userId: string,
  sourceDay: string,
  targetDays: string[],
): Promise<ValidationResult> {
  const normalizedSource = normalizeDayName(sourceDay);

  if (!normalizedSource) {
    return {
      isValid: false,
      errors: [`Invalid source day: "${sourceDay}"`],
    };
  }

  const normalizedTargets: string[] = [];
  const invalidTargets: string[] = [];

  for (const day of targetDays) {
    const normalized = normalizeDayName(day);
    if (normalized) {
      if (normalized !== normalizedSource) {
        normalizedTargets.push(normalized);
      }
    } else {
      invalidTargets.push(day);
    }
  }

  if (invalidTargets.length > 0) {
    return {
      isValid: false,
      errors: [`Invalid target day(s): ${invalidTargets.join(", ")}`],
    };
  }

  if (normalizedTargets.length === 0) {
    return {
      isValid: false,
      errors: ["No valid target days specified (cannot copy a day to itself)."],
    };
  }

  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    return { isValid: false, errors: ["You don't have a plan yet."] };
  }

  const existingDays = [...new Set(plan.tasks.map((task) => task.day))];

  if (!existingDays.includes(normalizedSource)) {
    return {
      isValid: false,
      errors: [`Source day "${normalizedSource}" has no tasks to copy.`],
    };
  }

  // Check for conflicts on target days
  const conflictingDays = normalizedTargets.filter((day) =>
    existingDays.includes(day),
  );

  return {
    isValid: true,
    errors: [],
    normalizedDays: [normalizedSource, ...normalizedTargets],
    existingDays,
    conflictingDays,
  };
}

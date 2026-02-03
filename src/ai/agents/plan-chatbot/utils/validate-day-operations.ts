import prisma from "@/lib/db";

/**
 * Day operations validation utilities
 */

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export interface DayOperationValidation {
  isValid: boolean;
  errors: string[];
  normalizedDays?: string[];
  conflictingDays?: string[];
  existingDays?: string[];
  missingDays?: string[];
}

/**
 * Normalize day names to proper case
 */
export function normalizeDayName(day: string): string | null {
  const normalized = day.trim().toLowerCase();
  if (VALID_DAYS.includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return null;
}

/**
 * Parse multiple day names from a string
 */
export function parseDayNames(daysString: string): string[] {
  const dayPatterns = daysString
    .toLowerCase()
    .split(/[,\s]+and|[,\s]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  const normalizedDays: string[] = [];
  for (const day of dayPatterns) {
    const normalized = normalizeDayName(day);
    if (normalized) {
      normalizedDays.push(normalized);
    }
  }

  return normalizedDays;
}

/**
 * Validate adding days off
 */
export async function validateAddDaysOff(
  userId: string,
  daysToAdd: string[],
): Promise<DayOperationValidation> {
  const errors: string[] = [];
  const normalizedDays: string[] = [];

  // Normalize and validate day names
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

  // Check if plan exists
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    errors.push("You don't have a plan yet. Create one first.");
    return { isValid: false, errors };
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
    errors.push(
      `Cannot mark ${conflictingDays.join(", ")} as days off because you have tasks scheduled on these days. Remove the tasks first.`,
    );
    return { isValid: false, errors, conflictingDays };
  }

  return {
    isValid: true,
    errors: [],
    normalizedDays,
  };
}

/**
 * Validate removing days from plan
 */
export async function validateRemoveDays(
  userId: string,
  daysToRemove: string[],
): Promise<DayOperationValidation> {
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
    errors.push("You don't have a plan yet.");
    return { isValid: false, errors };
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
    errors.push(
      "Cannot remove all days from your plan. Your plan would be empty.",
    );
    return { isValid: false, errors };
  }

  if (validDaysToRemove.length === 0) {
    errors.push("No valid days to remove from your plan.");
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors,
    normalizedDays: validDaysToRemove,
    existingDays,
    missingDays,
  };
}

/**
 * Validate copying day plan to another day or multiple days
 */
export async function validateCopyDay(
  userId: string,
  sourceDay: string,
  targetDays: string | string[],
): Promise<DayOperationValidation> {
  const errors: string[] = [];

  // Normalize source day
  const normalizedSource = normalizeDayName(sourceDay);
  if (!normalizedSource) {
    errors.push(`Invalid source day: "${sourceDay}"`);
    return { isValid: false, errors };
  }

  // Normalize target days (support both single and multiple)
  const targetDaysList = Array.isArray(targetDays) ? targetDays : [targetDays];
  const normalizedTargets: string[] = [];

  for (const target of targetDaysList) {
    const normalized = normalizeDayName(target);
    if (!normalized) {
      errors.push(`Invalid target day: "${target}"`);
    } else if (normalized === normalizedSource) {
      errors.push(`Cannot copy ${normalizedSource} to itself.`);
    } else if (normalizedTargets.includes(normalized)) {
      errors.push(`Duplicate target day: "${normalized}"`);
    } else {
      normalizedTargets.push(normalized);
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
    errors.push("You don't have a plan yet.");
    return { isValid: false, errors };
  }

  // Check if source day exists
  const sourceTasks = plan.tasks.filter((t) => t.day === normalizedSource);
  if (sourceTasks.length === 0) {
    errors.push(`Source day "${normalizedSource}" doesn't exist in your plan.`);
    return { isValid: false, errors };
  }

  // Check which target days already exist
  const existingTargets = normalizedTargets.filter((target) =>
    plan.tasks.some((t) => t.day === target),
  );

  return {
    isValid: true,
    errors: [],
    normalizedDays: [normalizedSource, ...normalizedTargets],
    existingDays: existingTargets,
  };
}

/**
 * Validate renaming a day
 */
export async function validateRenameDay(
  userId: string,
  oldDay: string,
  newDay: string,
): Promise<DayOperationValidation> {
  const errors: string[] = [];

  // Normalize day names
  const normalizedOld = normalizeDayName(oldDay);
  const normalizedNew = normalizeDayName(newDay);

  if (!normalizedOld) {
    errors.push(`Invalid old day: "${oldDay}"`);
  }
  if (!normalizedNew) {
    errors.push(`Invalid new day: "${newDay}"`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  if (normalizedOld === normalizedNew) {
    errors.push("Old and new day names cannot be the same.");
    return { isValid: false, errors };
  }

  // Check if plan exists
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    errors.push("You don't have a plan yet.");
    return { isValid: false, errors };
  }

  // Check if old day exists
  const oldDayTasks = plan.tasks.filter((t) => t.day === normalizedOld);
  if (oldDayTasks.length === 0) {
    errors.push(`Day "${normalizedOld}" doesn't exist in your plan.`);
    return { isValid: false, errors };
  }

  // Check if new day already exists
  const newDayTasks = plan.tasks.filter((t) => t.day === normalizedNew);
  const newDayExists = newDayTasks.length > 0;

  return {
    isValid: true,
    errors: [],
    normalizedDays: [normalizedOld!, normalizedNew!],
    existingDays: newDayExists ? [normalizedNew!] : [],
    conflictingDays: newDayExists ? [normalizedNew!] : [],
  };
}

/**
 * Validate swapping two days
 */
export async function validateSwapDays(
  userId: string,
  day1: string,
  day2: string,
): Promise<DayOperationValidation> {
  const errors: string[] = [];

  // Normalize day names
  const normalizedDay1 = normalizeDayName(day1);
  const normalizedDay2 = normalizeDayName(day2);

  if (!normalizedDay1) {
    errors.push(`Invalid day: "${day1}"`);
  }
  if (!normalizedDay2) {
    errors.push(`Invalid day: "${day2}"`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  if (normalizedDay1 === normalizedDay2) {
    errors.push("Cannot swap a day with itself.");
    return { isValid: false, errors };
  }

  // Check if plan exists
  const plan = await prisma.plan.findFirst({
    where: { userId },
    include: { tasks: true },
  });

  if (!plan) {
    errors.push("You don't have a plan yet.");
    return { isValid: false, errors };
  }

  // Check if both days exist
  const day1Tasks = plan.tasks.filter((t) => t.day === normalizedDay1);
  const day2Tasks = plan.tasks.filter((t) => t.day === normalizedDay2);

  const missingDays: string[] = [];
  if (day1Tasks.length === 0) missingDays.push(normalizedDay1!);
  if (day2Tasks.length === 0) missingDays.push(normalizedDay2!);

  if (missingDays.length > 0) {
    errors.push(
      `These days don't exist in your plan: ${missingDays.join(", ")}.`,
    );
    return { isValid: false, errors, missingDays };
  }

  return {
    isValid: true,
    errors: [],
    normalizedDays: [normalizedDay1!, normalizedDay2!],
    existingDays: [normalizedDay1!, normalizedDay2!],
  };
}

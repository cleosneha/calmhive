import type { PlanStateType } from "../state";
import type { ValidationResult } from "../types";
import {
  calculateDailyHours,
  calculateHoursSummary,
  parseEnergeticTime,
  isTimeWithinEnergeticWindow,
} from "../tools/time-calculator";
import { filterDaysOff } from "../tools/days-off-checker";

/**
 * Node: Validate the generated plan
 * Checks time constraints, days off violations, and energetic time constraints
 */
export async function validatePlanNode(
  state: PlanStateType,
): Promise<Partial<PlanStateType>> {
  try {
    const { generatedTasks, onboardingData } = state;

    if (!generatedTasks || generatedTasks.length === 0) {
      return {
        validation: {
          isValid: false,
          errors: ["No tasks generated"],
          warnings: [],
        },
        isComplete: false,
      };
    }

    if (!onboardingData) {
      return {
        validation: {
          isValid: false,
          errors: ["Onboarding data not available"],
          warnings: [],
        },
        isComplete: false,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Validate days off
    const tasksOnDaysOff = generatedTasks.filter((task) =>
      onboardingData.daysOff.includes(task.day),
    );

    if (tasksOnDaysOff.length > 0) {
      errors.push(
        `Found ${
          tasksOnDaysOff.length
        } tasks scheduled on days off: ${tasksOnDaysOff
          .map((t) => `${t.day} - ${t.activity}`)
          .join(", ")}`,
      );
    }

    // Check 2: Validate time constraints
    const dailyHours = calculateDailyHours(generatedTasks);
    const maxHours = onboardingData.timeAvailability / 60; // Convert minutes to hours

    Object.entries(dailyHours).forEach(([day, hours]) => {
      if (hours > maxHours) {
        errors.push(
          `${day}: ${hours.toFixed(
            1,
          )} hours exceeds limit of ${maxHours.toFixed(2)} hours`,
        );
      } else if (hours > maxHours * 0.9) {
        warnings.push(
          `${day}: ${hours.toFixed(
            1,
          )} hours is close to the limit of ${maxHours.toFixed(2)} hours`,
        );
      }
    });

    // Check 3: Validate time ranges format
    generatedTasks.forEach((task) => {
      if (!task.timeRange.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/)) {
        errors.push(
          `Invalid time range format for "${task.activity}": ${task.timeRange}`,
        );
      }
    });

    // Check 4: Validate energetic time constraint
    const energeticTimeLimit = parseEnergeticTime(onboardingData.energeticTime);
    if (energeticTimeLimit) {
      const tasksOutsideEnergeticTime = generatedTasks.filter(
        (task) =>
          !isTimeWithinEnergeticWindow(task.timeRange, energeticTimeLimit),
      );

      if (tasksOutsideEnergeticTime.length > 0) {
        errors.push(
          `Found ${
            tasksOutsideEnergeticTime.length
          } tasks outside energetic time window (${
            onboardingData.energeticTime
          }): ${tasksOutsideEnergeticTime
            .map((t) => `${t.day} ${t.timeRange} - ${t.activity}`)
            .join(", ")}`,
        );
      }
    }

    const validation: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    // console.log("🔍 Validation result:", validation);

    // If valid, mark as complete
    if (validation.isValid) {
      // Filter out any tasks on days off (just in case)
      const cleanedTasks = filterDaysOff(
        generatedTasks,
        onboardingData.daysOff,
      );

      // Calculate hours summary for DB storage
      const hoursSummary = calculateHoursSummary(
        cleanedTasks,
        onboardingData.daysOff,
      );

      // console.log("📊 Hours Summary:", hoursSummary);

      return {
        validation,
        hoursSummary,
        generatedTasks: cleanedTasks,
        isComplete: true,
        error: null,
        validationErrors: [], // Clear validation errors on success
      };
    }

    // If invalid, return validation errors for potential retry
    return {
      validation,
      isComplete: false,
      validationErrors: errors, // Store errors for retry
      error: `Plan validation failed: ${errors.join("; ")}`,
    };
  } catch (error) {
    console.error("❌ Error validating plan:", error);
    return {
      validation: {
        isValid: false,
        errors: [error instanceof Error ? error.message : "Validation failed"],
        warnings: [],
      },
      isComplete: false,
      error: error instanceof Error ? error.message : "Validation failed",
      validationErrors: [
        error instanceof Error ? error.message : "Validation failed",
      ],
    };
  }
}

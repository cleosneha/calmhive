/**
 * Types for Plan Generation Agent
 */

/**
 * Individual task in the weekly plan
 */
export interface PlanTask {
  day: string; // "Monday", "Tuesday", etc.
  timeRange: string; // "09:00-10:00"
  activity: string;
  duration: number; // in minutes
  notes?: string;
}

/**
 * Onboarding data used for plan generation
 */
export interface OnboardingData {
  userId: string;
  age: number;
  goals: string;
  goalSpecificInfo: Record<string, unknown>;
  timeAvailability: number; // in minutes per day (e.g., 45, 60, 120)
  activities: string;
  energeticTime: string;
  daysOff: string[];
  additionalNotes?: string;
}

/**
 * Hours summary for each day and week total
 */
export interface HoursSummary {
  [day: string]: number; // e.g., "Monday": 8, "Tuesday": 7
  weekTotal: number; // Total hours for the entire week
}

/**
 * Generated plan structure
 */
export interface GeneratedPlan {
  tasks: PlanTask[];
  totalHoursPerDay: Record<string, number>;
  daysOff: string[];
  hoursSummary?: HoursSummary;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

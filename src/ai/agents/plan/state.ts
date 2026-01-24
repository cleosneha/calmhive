import { Annotation } from "@langchain/langgraph";
import type { OnboardingData, PlanTask, ValidationResult } from "./types";

/**
 * Plan Generation Agent State
 * Tracks the state throughout the plan generation workflow
 */
export const PlanState = Annotation.Root({
  // User identification
  userId: Annotation<string>,

  // Optional AI plan suggestions (when regenerating from insights)
  planSuggestions: Annotation<string | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Onboarding data fetched from DB
  onboardingData: Annotation<OnboardingData | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Generated plan tasks
  generatedTasks: Annotation<PlanTask[]>({
    reducer: (_, value) => value,
    default: () => [],
  }),

  // Validation results
  validation: Annotation<ValidationResult | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Error tracking
  error: Annotation<string | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Completion flag
  isComplete: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // Retry tracking
  retryCount: Annotation<number>({
    reducer: (_, value) => value,
    default: () => 0,
  }),

  // Validation errors from previous attempt (for retry)
  validationErrors: Annotation<string[]>({
    reducer: (_, value) => value,
    default: () => [],
  }),

  // Hours summary for each day and week total
  hoursSummary: Annotation<Record<string, number> | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),
});

export type PlanStateType = typeof PlanState.State;

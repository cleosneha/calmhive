import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

/**
 * Onboarding Agent State
 * Shared state across all nodes in the onboarding flow
 */
export const OnboardingState = Annotation.Root({
  // Inherit messages from MessagesAnnotation (handles message array properly)
  ...MessagesAnnotation.spec,

  // User identification
  userId: Annotation<string>,
  userName: Annotation<string>,

  // Flow control
  step: Annotation<number>({
    reducer: (_, value) => value,
    default: () => 0,
  }),

  // User responses collected during onboarding
  responses: Annotation<Record<string, string>>({
    reducer: (current, updates) => ({ ...current, ...updates }),
    default: () => ({}),
  }),

  // Flags
  isComplete: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),
  waitingForSafetyAck: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // Store answer options for the goal-specific question
  currentGoalOptions: Annotation<string[]>({
    reducer: (_, value) => value,
    default: () => [],
  }),

  // Store the current goal-specific question text
  currentGoalSpecificQuestion: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  // Multi-select handling for days off
  selectedDays: Annotation<string[]>({
    reducer: (_, value) => value,
    default: () => [],
  }),
  isMultiSelectMode: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // DOB format clarification
  waitingForDateFormat: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),
  tentativeDateInput: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),
  // DOB full year clarification
  waitingForFullYear: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),
  partialDateInput: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),
});

export type OnboardingStateType = typeof OnboardingState.State;

import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

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
  needsSafetyRedirect: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),
});

export type OnboardingStateType = typeof OnboardingState.State;

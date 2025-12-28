/**
 * NOTE: This file is currently not in use.
 * The onboarding flow has been simplified and implemented directly in
 * src/actions/onboarding.ts without LangGraph for better maintainability.
 *
 * This file is kept for future reference if we want to migrate back to
 * a graph-based implementation.
 */

/**
 * State definition for onboarding flow
 */
export interface OnboardingState {
  userId: string;
  userName: string;
  step: number;
  responses: Record<string, string>;
  messages: { role: "assistant" | "user"; content: string }[];
  needsSafetyRedirect: boolean;
  safetyMessage?: string;
  isComplete: boolean;
}

// Rest of the implementation has been moved to src/actions/onboarding.ts
// This file is kept for reference only

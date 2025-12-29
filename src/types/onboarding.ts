/**
 * Onboarding-related types for CalmHive
 */

/**
 * Onboarding question structure
 */
export interface OnboardingQuestion {
  key: string;
  text: string;
  options: string[];
  required: boolean;
}

/**
 * Onboarding message type
 */
export interface OnboardingMessage {
  role: "assistant" | "user";
  content: string;
}

/**
 * Onboarding state (for graph/session)
 */
export interface OnboardingState {
  userId: string;
  userName: string;
  step: number;
  responses: Record<string, string>;
  messages: OnboardingMessage[];
  needsSafetyRedirect: boolean;
  safetyMessage?: string;
  isComplete: boolean;
}

/**
 * Onboarding session response
 */
export interface OnboardingSessionResponse {
  success: boolean;
  message?: string;
  state?: OnboardingState;
  error?: string;
}

/**
 * Onboarding layout props
 */
export interface OnboardingLayoutProps {
  children: React.ReactNode;
}

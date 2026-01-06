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
  followUps?: {
    [optionText: string]: {
      text: string;
      nextKey: string;
    };
  };
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
  * Goal-specific info stored in onboarding
  */
 export interface GoalSpecificInfo {
   question: string;
   answer: string;
 }
 
 /**
  * Onboarding responses object returned by the server
  */
 export interface OnboardingResponses {
   responses: {
     age: string;
     goals: string;
     goalSpecificInfo: GoalSpecificInfo | null;
     timeAvailability: string;
     activities: string;
     energeticTime: string;
     additionalNotes: string;
   };
   completedAt: Date | null;
 }
 
 /**

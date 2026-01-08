import type { OnboardingStateType } from "../../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import type { ValidationResult } from "../../../tools/validation";
import { handleAgeResponse } from "./age-handler";
import { handleGoalsResponse } from "./goals-handler";
import { handleTimeAvailabilityResponse } from "./time-availability-handler";
import { handleGoalSpecificInfoResponse } from "./goal-specific-info-handler";
import { handleActivitiesResponse } from "./activities-handler";
import { handleEnergeticTimeResponse } from "./energetic-time-handler";
import { handleGeneralResponse } from "./general-handler";

/**
 * Handler map: question key -> handler function
 * Each handler takes (question, userInput, validationResult, state) and returns state update or null
 */
export const questionHandlers = {
  age: handleAgeResponse,
  goals: handleGoalsResponse,
  timeAvailability: handleTimeAvailabilityResponse,
  goalSpecificInfo: handleGoalSpecificInfoResponse,
  activities: handleActivitiesResponse,
  energeticTime: handleEnergeticTimeResponse,
};

/**
 * Execute handler for a specific question type
 * Falls back to general handler for unspecified question types
 */
export async function executeQuestionHandler(
  question: OnboardingQuestion,
  userInput: string,
  validationResult: ValidationResult,
  state: OnboardingStateType,
  step: number
): Promise<Partial<OnboardingStateType> | null> {
  const handler =
    questionHandlers[question.key as keyof typeof questionHandlers];

  if (handler) {
    return handler(question, userInput, validationResult, state, step);
  }

  // Fallback: use general handler for questions not explicitly mapped
  return handleGeneralResponse(
    question,
    userInput,
    validationResult,
    state,
    step
  );
}

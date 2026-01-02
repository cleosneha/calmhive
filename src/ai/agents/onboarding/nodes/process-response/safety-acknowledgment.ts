import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

/**
 * Handle safety acknowledgment: user types 'continue' to proceed
 */
export function handleSafetyAcknowledgment(
  state: OnboardingStateType,
  userInput: string
): Partial<OnboardingStateType> | null {
  const isAcknowledgingSafety =
    state.waitingForSafetyAck && userInput.toLowerCase().includes("continue");

  if (!isAcknowledgingSafety) return null;

  const isLastQuestion = state.step === ONBOARDING_QUESTIONS.length;

  if (isLastQuestion) {
    return {
      waitingForSafetyAck: false,
      step: state.step + 1,
      isComplete: true,
    };
  }

  return {
    waitingForSafetyAck: false,
    step: state.step + 1,
  };
}

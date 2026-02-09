import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

/**
 * Handle safety acknowledgment: user types 'continue' to proceed
 * Re-asks the question that triggered the safety warning
 */
export function handleSafetyAcknowledgment(
  state: OnboardingStateType,
  userInput: string,
): Partial<OnboardingStateType> | null {
  const isAcknowledgingSafety =
    state.waitingForSafetyAck && userInput.toLowerCase().includes("continue");

  if (!isAcknowledgingSafety) return null;

  // Get the question that triggered the safety warning
  const question =
    state.step >= 0 && state.step < ONBOARDING_QUESTIONS.length
      ? ONBOARDING_QUESTIONS[state.step]
      : null;

  // Re-ask the current question with firstName placeholder replaced
  if (question) {
    const questionText = question.text.replace("{firstName}", state.userName);
    return {
      waitingForSafetyAck: false,
      messages: [new AIMessage(questionText)],
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  return {
    waitingForSafetyAck: false,
    messages: [],
    currentGoalOptions: [],
    currentGoalSpecificQuestion: "",
  };
}

import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { OnboardingQuestion } from "@/types";

/**
 * Handle empty response for optional questions
 */
export function handleEmptyResponse(
  question: OnboardingQuestion,
  userInput: string,
  step: number
): Partial<OnboardingStateType> | null {
  if (!question || question.required || userInput) return null;

  const isLastQuestion = step === ONBOARDING_QUESTIONS.length;

  if (isLastQuestion) {
    return {
      step: step + 1,
      isComplete: true,
      messages: [
        new AIMessage(
          "No worries at all! You've already shared so much valuable information. 🤍"
        ),
      ],
    };
  }

  return {
    step: step + 1,
  };
}

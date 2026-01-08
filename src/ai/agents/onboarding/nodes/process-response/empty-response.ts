import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { OnboardingQuestion } from "@/types";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";
import { isLastQuestionIndex } from "./handlers/utils";

/**
 * Handle empty response for optional questions
 */
export function handleEmptyResponse(
  question: OnboardingQuestion,
  userInput: string,
  step: number
): Partial<OnboardingStateType> | null {
  if (!question || question.required || userInput) return null;

  const isLastQuestion = isLastQuestionIndex(step);

  if (isLastQuestion) {
    return {
      step: step + 1,
      isComplete: true,
      messages: [new AIMessage(HARD_CODED_MESSAGES.SKIP_ACK)],
    };
  }

  return {
    step: step + 1,
  };
}

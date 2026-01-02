import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { OnboardingQuestion } from "@/types";

/**
 * Helper: Get question index by key
 */
function getQuestionIndexByKey(key: string): number {
  return ONBOARDING_QUESTIONS.findIndex((q) => q.key === key);
}

/**
 * Handle storage of predefined option responses
 */
export function handlePredefinedOptionStorage(
  question: OnboardingQuestion,
  userInput: string,
  step: number,
  state: OnboardingStateType
): Partial<OnboardingStateType> | null {
  if (!question || !userInput) return null;

  console.log("[OPTION-STORAGE] Processing predefined option:", {
    questionKey: question.key,
    currentStep: step,
    userInput,
  });

  const newResponses = {
    [question.key]: userInput,
  };

  const isLastQuestion = step === ONBOARDING_QUESTIONS.length - 1;

  const stateUpdate: Partial<OnboardingStateType> = {
    responses: newResponses,
  };

  // Clear goal-specific state when leaving goalSpecificInfo
  if (question.key === "goalSpecificInfo") {
    stateUpdate.currentGoalOptions = [];
  }

  if (isLastQuestion) {
    const isSkip = userInput.toLowerCase().includes("skip");

    if (isSkip) {
      stateUpdate.step = step + 1;
      stateUpdate.isComplete = true;
      stateUpdate.messages = [
        new AIMessage(
          "No worries at all! You've already shared so much valuable information. 🤍"
        ),
      ];
      return stateUpdate;
    }

    stateUpdate.step = step + 1;
    stateUpdate.isComplete = true;
    return stateUpdate;
  }

  // Determine next step based on followUps.nextKey (for branching logic)
  let nextStep = step + 1; // Default: linear progression

  if (question.followUps) {
    // Get the follow-up for this user's response
    const followUp =
      question.followUps[userInput] || question.followUps["default"];

    if (followUp && followUp.nextKey) {
      // Find the index of the next question by its key
      const nextQuestionIndex = getQuestionIndexByKey(followUp.nextKey);
      if (nextQuestionIndex !== -1) {
        nextStep = nextQuestionIndex;
        console.log("[OPTION-STORAGE] Using branching logic:", {
          currentKey: question.key,
          nextKey: followUp.nextKey,
          nextStep,
        });
      }
    }
  }

  console.log("[OPTION-STORAGE] Moving to next step:", {
    currentStep: step,
    nextStep,
  });
  stateUpdate.step = nextStep;
  return stateUpdate;
}

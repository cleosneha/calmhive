import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { OnboardingQuestion } from "@/types";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";

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

  // Special handling for goalSpecificInfo - store as JSON with question and answer
  let newResponses: Record<string, string>;
  if (
    question.key === "goalSpecificInfo" &&
    state.currentGoalSpecificQuestion
  ) {
    const goalSpecificData = {
      question: state.currentGoalSpecificQuestion,
      answer: userInput,
    };
    newResponses = {
      [question.key]: JSON.stringify(goalSpecificData),
    };
  } else {
    newResponses = {
      [question.key]: userInput,
    };
  }

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
      stateUpdate.messages = [new AIMessage(HARD_CODED_MESSAGES.SKIP_ACK)];
      return stateUpdate;
    }

    stateUpdate.step = step + 1;
    stateUpdate.isComplete = true;
    return stateUpdate;
  }

  // Determine next step based on followUps.nextKey (for branching logic)
  let nextStep = step + 1; // Default: linear progression
  let followUpMessage = ""; // Store follow-up message

  if (question.followUps) {
    // Get the follow-up for this user's response
    const followUp =
      question.followUps[userInput] || question.followUps["default"];

    if (followUp && followUp.nextKey) {
      // Store the follow-up message if it exists
      if (followUp.text && followUp.text.trim() !== "") {
        followUpMessage = followUp.text;
      }

      // Find the index of the next question by its key
      const nextQuestionIndex = getQuestionIndexByKey(followUp.nextKey);
      if (nextQuestionIndex !== -1) {
        nextStep = nextQuestionIndex;
      }
    }
  }

  stateUpdate.step = nextStep;

  // Add follow-up message if available
  if (followUpMessage) {
    stateUpdate.messages = [new AIMessage(followUpMessage)];
  }

  return stateUpdate;
}

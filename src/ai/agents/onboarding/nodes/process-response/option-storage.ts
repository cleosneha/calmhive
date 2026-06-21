import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { OnboardingQuestion } from "@/types";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";
import { parseAndMapTime } from "../../utils/time-utils";
import { buildMessage } from "./handlers/utils";

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

  // Declare newResponses first
  let newResponses: Record<string, string>;

  // Special handling for timeAvailability - parse time to minutes
  if (question.key === "timeAvailability") {
    const parsed = parseAndMapTime(userInput);
    // console.log( "⏱️ [option-storage] Time parsing - Input:", userInput, "| Parsed:", parsed );

    newResponses = {
      [question.key]: parsed.mins !== null ? parsed.mins.toString() : userInput,
    };
  } else if (
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
    const nextQuestion = ONBOARDING_QUESTIONS[nextStep];

    // Special-case readiness 'No' response: only show the acknowledgment text
    if (question.key === "readiness") {
      stateUpdate.messages = [new AIMessage(followUpMessage)];
    } else {
      stateUpdate.messages = [
        new AIMessage(
          buildMessage(
            {
              isValid: true,
              isRelevant: true,
              hasSafetyIssue: false,
              followUpText: followUpMessage,
            },
            undefined,
            nextQuestion
          )
        ),
      ];
    }
  }

  return stateUpdate;
}

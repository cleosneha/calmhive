import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { mapAgeToRange } from "@/ai/agents/onboarding/utils/age-mapper";
import { validateUserResponse } from "../../tools/validation";
import { validateTimeResponse } from "../../utils/time-validator";
import { handleModificationRequest } from "./modification-handling";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";

/**
 * Helper: Parse activities string into array
 * Handles comma-separated and conjunction-separated lists
 */
function parseActivities(input: string): string[] {
  if (!input) return [];

  // Split by commas, "and", "&", "or", etc.
  const activities = input
    .split(/[,&]|(?:\s+and\s+)|(?:\s+or\s+)/i)
    .map((activity) => activity.trim())
    .filter((activity) => activity.length > 0);

  return activities;
}

/**
 * Helper: Get question index by key
 */
function getQuestionIndexByKey(key: string): number {
  return ONBOARDING_QUESTIONS.findIndex((q) => q.key === key);
}

/**
 * Handle custom response validation and processing
 */
export async function handleCustomResponse(
  question: OnboardingQuestion,
  userInput: string,
  step: number,
  _state: OnboardingStateType
): Promise<Partial<OnboardingStateType> | null> {
  const isLastQuestion = step === ONBOARDING_QUESTIONS.length;
  const nextQuestionText = isLastQuestion
    ? "Acknowledge their response warmly and thank them for sharing."
    : ONBOARDING_QUESTIONS[step]?.text || "";

  if (!nextQuestionText) return null;

  const validationResult = await validateUserResponse(
    userInput,
    question.text,
    nextQuestionText
  );

  // Handle modification request - user wants to update a previous response
  const modificationResult = await handleModificationRequest(
    validationResult,
    question,
    step
  );
  if (modificationResult) {
    return modificationResult;
  }

  // Handle skip request from LLM
  if (validationResult.userWantsToSkip) {
    const isLastQuestion = step === ONBOARDING_QUESTIONS.length;
    const isOptionalQuestion = !question.required;

    // Only allow skip if it's the last question or the question is optional
    if (!isLastQuestion && !isOptionalQuestion) {
      return {
        messages: [new AIMessage(HARD_CODED_MESSAGES.SKIP_PROMPT)],
        step,
      };
    }

    // Skip is allowed - acknowledge and move forward
    if (isLastQuestion) {
      return {
        step: step + 1,
        isComplete: true,
        messages: [new AIMessage(HARD_CODED_MESSAGES.SKIP_ACK)],
      };
    }

    // Skip optional question and move to next
    return {
      step: step + 1,
    };
  }

  // Handle safety issue (detected by rules or LLM)
  if (validationResult.hasSafetyIssue) {
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY_LONG)],
      step,
      waitingForSafetyAck: true,
    };
  }

  // Handle irrelevant response
  if (!validationResult.isRelevant) {
    return {
      messages: [new AIMessage(validationResult.errorMessage || "")],
      step,
    };
  }

  // Special handling for age question: map to range and select followUp
  let newResponses: Record<string, string>;
  let followUpText: string | undefined;
  let nextKey: string | undefined;

  if (question.key === "age") {
    const mappedRange = mapAgeToRange(userInput);
    // Store the original user input, but use mapped range for followUp
    newResponses = { [question.key]: userInput };
    if (mappedRange && question.followUps && question.followUps[mappedRange]) {
      followUpText = question.followUps[mappedRange].text;
      nextKey = question.followUps[mappedRange].nextKey;
    } else if (question.followUps && question.followUps.default) {
      followUpText = question.followUps.default.text;
      nextKey = question.followUps.default.nextKey;
    }
  } else if (
    question.key === "goalSpecificInfo" &&
    _state.currentGoalSpecificQuestion
  ) {
    const goalSpecificData = {
      question: _state.currentGoalSpecificQuestion,
      answer: userInput,
    };
    console.log("📝 Storing goalSpecificInfo:", goalSpecificData);
    newResponses = {
      [question.key]: JSON.stringify(goalSpecificData),
    };
  } else if (question.key === "activities") {
    // Store activities as plain string (not parsed into array)
    console.log("📝 Storing activities as string:", userInput);
    newResponses = {
      [question.key]: userInput,
    };
  } else {
    newResponses = {
      [question.key]: userInput,
    };
  }

  const stateUpdate: Partial<OnboardingStateType> = {
    responses: newResponses,
  };

  console.log("📦 State update being returned:", {
    questionKey: question.key,
    responses: newResponses,
    step,
  });

  // Store goal options if available
  if (validationResult.goalOptions && validationResult.goalOptions.length > 0) {
    stateUpdate.currentGoalOptions = validationResult.goalOptions;
  }

  // For age question, use mapped followUp and jump to correct nextKey if set
  if (question.key === "age" && followUpText && nextKey) {
    const nextQuestionIndex = getQuestionIndexByKey(nextKey);
    stateUpdate.step = nextQuestionIndex !== -1 ? nextQuestionIndex : step + 1;
    stateUpdate.messages = [new AIMessage(followUpText)];
    return stateUpdate;
  }

  // For goal questions with options, use default followUp to get nextKey and move accordingly
  if (
    question.key === "goals" &&
    validationResult.goalOptions &&
    validationResult.goalOptions.length > 0
  ) {
    const followUpMsg =
      validationResult.followUpText || `Thank you for sharing that goal.`;

    // Append goal-specific question if available
    let fullMessage = followUpMsg;
    if (validationResult.goalSpecificQuestion) {
      fullMessage += `\n\n${validationResult.goalSpecificQuestion}`;
    }

    // Get the default followUp to find the nextKey
    const defaultFollowUp = question.followUps?.["default"];
    let nextStep = step + 1; // Default: linear progression

    if (defaultFollowUp && defaultFollowUp.nextKey) {
      const nextQuestionIndex = getQuestionIndexByKey(defaultFollowUp.nextKey);
      if (nextQuestionIndex !== -1) {
        nextStep = nextQuestionIndex;
      }
    }

    stateUpdate.step = nextStep;
    stateUpdate.messages = [new AIMessage(fullMessage)];

    // Store the goal-specific question for later reference
    if (validationResult.goalSpecificQuestion) {
      stateUpdate.currentGoalSpecificQuestion =
        validationResult.goalSpecificQuestion;
    }

    return stateUpdate;
  }

  // Handle last question
  if (isLastQuestion) {
    stateUpdate.step = step + 1;
    stateUpdate.isComplete = true;
    stateUpdate.messages = [new AIMessage(validationResult.followUpText || "")];
    return stateUpdate;
  }

  // Special handling for time availability question: map to range and get appropriate follow-up
  if (question.key === "timeAvailability") {
    const timeValidation = validateTimeResponse(userInput);
    console.log("⏱️ Time validation result:", timeValidation);

    if (timeValidation.mappedRange) {
      // Get the follow-up for this time range
      const timeFollowUp = question.followUps?.[timeValidation.mappedRange];

      if (timeFollowUp) {
        const nextQuestionIndex = getQuestionIndexByKey(timeFollowUp.nextKey);

        // Extract time in minutes from input
        const hoursMatch = userInput.match(/(-?\d{1,2})\s*(hours|hrs|h)/i);
        const minsMatch = userInput.match(/(-?\d{1,4})\s*(minutes|min|m)/i);

        let totalMins = 0;
        if (hoursMatch) totalMins += parseInt(hoursMatch[1], 10) * 60;
        if (minsMatch) totalMins += parseInt(minsMatch[1], 10);

        console.log("📝 Storing timeAvailability:", totalMins, "minutes");

        // Build message: LLM acknowledgment + follow-up from questions.ts (which already includes next question)
        let fullMessage =
          validationResult.followUpText || "Thank you for sharing!";

        if (timeFollowUp.text) {
          fullMessage += `\n\n${timeFollowUp.text}`;
        }

        return {
          responses: {
            ...newResponses,
            // Store time in minutes as integer, not the original string
            timeAvailability: totalMins.toString(),
            timeAvailabilityRange: timeValidation.mappedRange,
          },
          messages: [new AIMessage(fullMessage)],
          step: nextQuestionIndex !== -1 ? nextQuestionIndex : step + 1,
        };
      }
    }
  }

  // Regular question progression
  stateUpdate.step = step + 1;
  stateUpdate.messages = [new AIMessage(validationResult.followUpText || "")];
  return stateUpdate;
}

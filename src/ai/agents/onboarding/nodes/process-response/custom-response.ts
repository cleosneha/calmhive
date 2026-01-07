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

  type ValidationResult = Awaited<ReturnType<typeof validateUserResponse>> & {
    mappedResponse?: string;
  };
  const validationResult: ValidationResult = await validateUserResponse(
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
    // Prefer mappedResponse from validation if present to avoid extra mapping
    const mappedRange =
      (validationResult && validationResult.mappedResponse) ||
      mapAgeToRange(userInput);

    // Store the original user input
    newResponses = { [question.key]: userInput };

    // If mapping failed (defensive), ask user to re-enter — do not advance
    if (!mappedRange) {
      return {
        messages: [new AIMessage(HARD_CODED_MESSAGES.AGE_INVALID)],
        step,
      };
    }

    // Use mapped range followUp if available
    if (mappedRange && question.followUps && question.followUps[mappedRange]) {
      followUpText = question.followUps[mappedRange].text;
      nextKey = question.followUps[mappedRange].nextKey;
    } else if (question.followUps && question.followUps.default) {
      // Fallback to default followUp (should be rare for age since followUps map ranges)
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
    newResponses = {
      [question.key]: JSON.stringify(goalSpecificData),
    };

    // Get next question from followUps (should be timeAvailability)
    if (question.followUps && question.followUps.default) {
      followUpText = question.followUps.default.text;
      nextKey = question.followUps.default.nextKey;
    } else {
      console.warn("⚠️ goalSpecificInfo followUps.default not found!");
    }
  } else if (question.key === "activities") {
    // Store activities as plain string (not parsed into array)
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

  // For goalSpecificInfo with custom response, advance to next question (timeAvailability)
  if (question.key === "goalSpecificInfo") {
    if (followUpText && nextKey) {
      const nextQuestionIndex = getQuestionIndexByKey(nextKey);
      const nextQuestion =
        nextQuestionIndex !== -1
          ? ONBOARDING_QUESTIONS[nextQuestionIndex]
          : null;

      // Build message: LLM acknowledgment + followUp from questions.ts (which includes next question)
      let fullMessage =
        validationResult.followUpText || "Thank you for sharing!";

      if (followUpText) {
        fullMessage += `\n\n${followUpText}`;
      }

      if (nextQuestion && nextQuestion.text) {
        fullMessage += `\n\n${nextQuestion.text}`;
      }

      stateUpdate.step =
        nextQuestionIndex !== -1 ? nextQuestionIndex : step + 1;
      stateUpdate.messages = [new AIMessage(fullMessage)];
      return stateUpdate;
    } else {
      console.warn(
        "⚠️ goalSpecificInfo - missing followUpText or nextKey, falling through"
      );
    }
  }

  // For goal questions: check if user selected hardcoded option or typed custom text
  if (question.key === "goals") {
    // Check if user selected a hardcoded option
    const selectedOption = question.options?.find(
      (opt) => opt.toLowerCase() === userInput.toLowerCase()
    );

    if (selectedOption) {
      // Hardcoded option selected - use its specific followUp
      const optionFollowUp = question.followUps?.[selectedOption];

      if (optionFollowUp) {
        const nextQuestionIndex = getQuestionIndexByKey(optionFollowUp.nextKey);
        const nextQuestion =
          nextQuestionIndex !== -1
            ? ONBOARDING_QUESTIONS[nextQuestionIndex]
            : null;

        let fullMessage = optionFollowUp.text;
        if (nextQuestion && nextQuestion.text) {
          fullMessage += `\n\n${nextQuestion.text}`;
        }

        stateUpdate.step =
          nextQuestionIndex !== -1 ? nextQuestionIndex : step + 1;
        stateUpdate.messages = [new AIMessage(fullMessage)];
        return stateUpdate;
      }
    } else if (
      validationResult.goalOptions &&
      validationResult.goalOptions.length > 0
    ) {
      // Custom text - extract goals and show goalSpecificInfo
      const followUpMsg =
        validationResult.followUpText || `Thank you for sharing that goal.`;

      // Append goal-specific question if available
      let fullMessage = followUpMsg;
      if (validationResult.goalSpecificQuestion) {
        fullMessage += `\n\n${validationResult.goalSpecificQuestion}`;
      }

      // Get the default followUp to find the nextKey (should be goalSpecificInfo)
      const defaultFollowUp = question.followUps?.["default"];
      let nextStep = step + 1;

      if (defaultFollowUp && defaultFollowUp.nextKey) {
        const nextQuestionIndex = getQuestionIndexByKey(
          defaultFollowUp.nextKey
        );
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
  }

  // General handler for questions with followUps (e.g., stressAspect, habitArea, sleepChallenge)
  // This handles both hardcoded options and custom text
  if (question.followUps && Object.keys(question.followUps).length > 0) {
    // Check if user selected a hardcoded option
    const selectedOption = question.options?.find(
      (opt) => opt.toLowerCase() === userInput.toLowerCase()
    );

    let followUpToUse;
    if (selectedOption && question.followUps[selectedOption]) {
      // Hardcoded option selected
      followUpToUse = question.followUps[selectedOption];
    } else if (question.followUps.default) {
      // Custom text provided - use default followUp
      followUpToUse = question.followUps.default;
    }

    if (followUpToUse) {
      const nextQuestionIndex = getQuestionIndexByKey(followUpToUse.nextKey);

      // Build message: LLM acknowledgment + followUp text
      // Note: followUpToUse.text already includes the next question, so don't append it again
      let fullMessage =
        validationResult.followUpText || "Thank you for sharing!";

      if (followUpToUse.text) {
        fullMessage += `\n\n${followUpToUse.text}`;
      }

      stateUpdate.step =
        nextQuestionIndex !== -1 ? nextQuestionIndex : step + 1;
      stateUpdate.messages = [new AIMessage(fullMessage)];
      return stateUpdate;
    }
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

    if (timeValidation.mappedRange) {
      // Get the follow-up for this time range
      const timeFollowUp = question.followUps?.[timeValidation.mappedRange];

      if (timeFollowUp) {
        const nextQuestionIndex = getQuestionIndexByKey(timeFollowUp.nextKey);

        // Extract time in minutes from input (supports: "2 hrs", "1.5 hours", "90 minutes", "90")
        const hoursMatch = userInput.match(
          /(-?\d+(?:\.\d+)?)\s*(hours|hrs|h)\b/i
        );
        const minsMatch = userInput.match(
          /(-?\d+(?:\.\d+)?)\s*(minutes|min|m)\b/i
        );
        const plainNumberMatch = userInput.match(/^\s*(-?\d+(?:\.\d+)?)\s*$/);

        let totalMins = 0;
        if (hoursMatch) {
          const hours = parseFloat(hoursMatch[1]);
          totalMins += hours * 60;
        }
        if (minsMatch) {
          const mins = parseFloat(minsMatch[1]);
          totalMins += mins;
        }
        if (!hoursMatch && !minsMatch && plainNumberMatch) {
          // Plain number - assume minutes
          totalMins = parseFloat(plainNumberMatch[1]);
        }

        // Round to nearest integer
        totalMins = Math.round(totalMins);

        // Build message: LLM acknowledgment + follow-up from questions.ts (which already includes next question)
        let fullMessage =
          validationResult.followUpText || "Thank you for sharing!";

        if (timeFollowUp.text) {
          fullMessage += `\n\n${timeFollowUp.text}`;
        }

        return {
          responses: {
            ...newResponses,
            // Store time in minutes as string, not the original input
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

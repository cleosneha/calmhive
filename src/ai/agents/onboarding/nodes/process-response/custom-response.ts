import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { validateUserResponse } from "../../tools/validation";

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

  console.log("Custom Response - Validation Result:", {
    hasSafetyIssue: validationResult.hasSafetyIssue,
    isRelevant: validationResult.isRelevant,
    safetyMessage: validationResult.safetyMessage?.substring(0, 50),
  });

  // Handle skip request from LLM
  if (validationResult.userWantsToSkip) {
    const isLastQuestion = step === ONBOARDING_QUESTIONS.length;
    const isOptionalQuestion = !question.required;

    // Only allow skip if it's the last question or the question is optional
    if (!isLastQuestion && !isOptionalQuestion) {
      return {
        messages: [
          new AIMessage(
            "I'd really appreciate your thoughts on this question. Could you please share your response?"
          ),
        ],
        step,
      };
    }

    // Skip is allowed - acknowledge and move forward
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

    // Skip optional question and move to next
    return {
      step: step + 1,
    };
  }

  // Handle age mapping (numeric age converted to range)
  if (validationResult.mappedResponse) {
    const mappedUserInput = validationResult.mappedResponse;
    const mappedFollowUp = question.followUps?.[mappedUserInput];

    const newResponses = {
      [question.key]: mappedUserInput,
    };

    if (mappedFollowUp && mappedFollowUp.nextKey) {
      return {
        responses: newResponses,
        step: step + 1,
        messages: [new AIMessage(mappedFollowUp.text)],
      };
    }
  }

  // Handle safety issue (detected by rules or LLM)
  if (validationResult.hasSafetyIssue) {
    const safetyMsg =
      "I appreciate you sharing that, but I want to make sure we're aligned. 🤍\n\n" +
      "It sounds like you might be going through something really difficult right now. Your safety and well-being are incredibly important to us.\n\n" +
      "There are people who genuinely care and want to help. You don't have to go through this alone. Please take that first step and reach out to someone today. 🤍" +
      "CalmHive is designed to support well-being and healthy habits. " +
      "Could you please share a goal that aligns with what CalmHive can support you with?";

    return {
      messages: [new AIMessage(safetyMsg)],
      step,
    };
  }

  // Handle irrelevant response
  if (!validationResult.isRelevant) {
    return {
      messages: [new AIMessage(validationResult.errorMessage || "")],
      step,
    };
  }

  // Valid response - prepare state update
  const newResponses = {
    [question.key]: userInput,
  };

  const stateUpdate: Partial<OnboardingStateType> = {
    responses: newResponses,
  };

  // Store goal options if available
  if (validationResult.goalOptions && validationResult.goalOptions.length > 0) {
    stateUpdate.currentGoalOptions = validationResult.goalOptions;
  }

  // For goal questions with options, move to goalSpecificInfo and show the goal question
  if (
    question.key === "goals" &&
    validationResult.goalOptions &&
    validationResult.goalOptions.length > 0
  ) {
    const followUpMsg =
      validationResult.followUpText || `Thank you for sharing that goal.`;

    stateUpdate.step = step + 1;
    stateUpdate.messages = [new AIMessage(followUpMsg)];
    return stateUpdate;
  }

  // Handle last question
  if (isLastQuestion) {
    stateUpdate.step = step + 1;
    stateUpdate.isComplete = true;
    stateUpdate.messages = [new AIMessage(validationResult.followUpText || "")];
    return stateUpdate;
  }

  // Regular question progression
  stateUpdate.step = step + 1;
  stateUpdate.messages = [new AIMessage(validationResult.followUpText || "")];
  return stateUpdate;
}

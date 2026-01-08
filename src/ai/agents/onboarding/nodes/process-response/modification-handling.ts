import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { validateUserResponse } from "../../tools/validation";
import type { ValidationResult } from "../../tools/validation";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";
import { buildMessage } from "./handlers/utils";

/**
 * Helper: Get question index by key
 */
function getQuestionIndexByKey(key: string): number {
  return ONBOARDING_QUESTIONS.findIndex((q) => q.key === key);
}

/**
 * Handle modification of a previous response
 * Returns null if modification is not valid/applicable, otherwise returns state update
 */
export async function handleModificationRequest(
  validationResult: ValidationResult,
  question: OnboardingQuestion,
  step: number
): Promise<Partial<OnboardingStateType> | null> {
  // Check if modification is requested
  if (
    !validationResult.modificationRequired ||
    !validationResult.modifiedField ||
    !validationResult.modifiedValue
  ) {
    return null;
  }

  // Find the question being modified
  const modifiedQuestion = ONBOARDING_QUESTIONS.find(
    (q) => q.key === validationResult.modifiedField
  );

  if (!modifiedQuestion) {
    return null;
  }

  // Validate the modified value for safety/relevance
  const modifiedValidation = await validateUserResponse(
    validationResult.modifiedValue,
    modifiedQuestion.text,
    question.text // Current question as "next" for context
  );

  // Check if modification has safety issues
  if (modifiedValidation.hasSafetyIssue) {
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY_UPDATE)],
      step, // Stay on current step
    };
  }

  // Check relevance of modification
  if (!modifiedValidation.isRelevant) {
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.MODIFICATION_INVALID)],
      step,
    };
  }

  // Normalize field name: "main goal" -> "goals"
  const normalizedField =
    validationResult.modifiedField === "main goal"
      ? "goals"
      : validationResult.modifiedField;

  // Process the modified value (parse if needed)
  let processedValue = validationResult.modifiedValue;

  // For timeAvailability modifications, parse time to minutes
  if (normalizedField === "timeAvailability") {
    const { parseAndMapTime } = await import("../../utils/time-utils");
    const parsed = parseAndMapTime(validationResult.modifiedValue);
    if (parsed.mins !== null) {
      processedValue = parsed.mins.toString();
    }
  }

  // Valid modification - update the response and acknowledge
  const updatedResponses = {
    [normalizedField]: processedValue,
  };

  const acknowledgmentMsg =
    validationResult.followUpText ||
    "Got it! Your response has been updated. 🤍";

  // Special handling for goals modification: regenerate goal-specific question
  if (normalizedField === "goals") {
    return handleGoalsModification(
      validationResult,
      modifiedValidation,
      modifiedQuestion,
      question,
      step,
      updatedResponses,
      acknowledgmentMsg
    );
  }

  // Append current question to be re-asked for non-goal modifications
  const message = buildMessage(
    { ...modifiedValidation, followUpText: acknowledgmentMsg },
    undefined,
    question
  );

  return {
    responses: updatedResponses,
    messages: [new AIMessage(message)],
    step, // Stay on current step to re-answer the question
  };
}

/**
 * Special handling for goals modification
 * Uses goal-specific question and options from validation result, then jumps to goalSpecificInfo step
 */
async function handleGoalsModification(
  validationResult: ValidationResult,
  modifiedValidation: ValidationResult,
  modifiedQuestion: OnboardingQuestion,
  currentQuestion: OnboardingQuestion,
  currentStep: number,
  updatedResponses: Record<string, string>,
  acknowledgmentMsg: string
): Promise<Partial<OnboardingStateType>> {
  // Build acknowledgment message
  let followUp = acknowledgmentMsg;

  // Check if goal-specific question and options are available from the validation
  const hasGoalSpecificInfo =
    validationResult.goalSpecificQuestion && validationResult.goalOptions;

  // If new goal-specific question is available, include it
  if (hasGoalSpecificInfo) {
    followUp += `\n\n${validationResult.goalSpecificQuestion}`;

    const goalSpecificInfoIndex = getQuestionIndexByKey("goalSpecificInfo");

    const message = buildMessage(
      { ...validationResult, followUpText: followUp },
      undefined,
      undefined
    );

    return {
      responses: updatedResponses,
      messages: [new AIMessage(message)],
      step: goalSpecificInfoIndex !== -1 ? goalSpecificInfoIndex : currentStep,
      currentGoalOptions: validationResult.goalOptions || [],
      currentGoalSpecificQuestion: validationResult.goalSpecificQuestion!,
    };
  }

  // Fallback: Re-validate goals to get new goal-specific question if not provided
  const goalsQuestion = ONBOARDING_QUESTIONS.find((q) => q.key === "goals");
  const goalRevalidation = await validateUserResponse(
    validationResult.modifiedValue ?? "",
    goalsQuestion?.text ?? "What are your main goals for using CalmHive?",
    "Tell me more about this goal."
  );

  if (goalRevalidation.goalSpecificQuestion) {
    followUp += `\n\n${goalRevalidation.goalSpecificQuestion}`;

    const goalSpecificInfoIndex = getQuestionIndexByKey("goalSpecificInfo");

    const message = buildMessage(
      { ...goalRevalidation, followUpText: followUp },
      undefined,
      undefined
    );

    return {
      responses: updatedResponses,
      messages: [new AIMessage(message)],
      step: goalSpecificInfoIndex !== -1 ? goalSpecificInfoIndex : currentStep,
      currentGoalOptions: goalRevalidation.goalOptions || [],
      currentGoalSpecificQuestion: goalRevalidation.goalSpecificQuestion,
    };
  }

  // No new goal-specific question, just acknowledge and stay
  const message = buildMessage(
    { ...modifiedValidation, followUpText: followUp },
    undefined,
    undefined
  );

  return {
    responses: updatedResponses,
    messages: [new AIMessage(message)],
    step: currentStep,
  };
}

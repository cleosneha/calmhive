import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { validateUserResponse } from "../../tools/validation";
import { handleModificationRequest } from "./modification-handling";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";
import { executeQuestionHandler } from "./handlers";
import { isLastQuestionIndex, buildMessage } from "./handlers/utils";

/**
 * Main orchestrator: Handle custom response validation and processing
 * Delegates question-specific logic to handlers
 */
export async function handleCustomResponse(
  question: OnboardingQuestion,
  userInput: string,
  step: number,
  state: OnboardingStateType
): Promise<Partial<OnboardingStateType> | null> {
  const isLastQuestion = isLastQuestionIndex(step);
  const nextQuestionText = isLastQuestion
    ? "Acknowledge their response warmly and thank them for sharing."
    : ONBOARDING_QUESTIONS[step + 1]?.text || "";

  // If there's no next question text and not last, there's nothing to validate against
  if (!isLastQuestion && !nextQuestionText) return null;

  // Validate response using LLM (handle LLM failures gracefully)
  let validationResult;
  try {
    validationResult = await validateUserResponse(
      userInput,
      question.text,
      nextQuestionText
    );
  } catch (err) {
    console.error("Error validating user response via LLM:", err);
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.LLM_ERROR)],
      step,
    };
  }

  // PRIORITY 1: Handle modification request - user wants to update a previous response
  const modificationResult = await handleModificationRequest(
    validationResult,
    question,
    step
  );
  console.log(
    "  🔧 [Modification Check]",
    "modificationRequired:",
    validationResult.modificationRequired,
    "| modifiedField:",
    validationResult.modifiedField,
    "| modifiedValue:",
    validationResult.modifiedValue
  );
  if (modificationResult) {
    console.log("  ✅ Modification handled, returning result");
    return modificationResult;
  }

  // PRIORITY 2: Handle skip request
  if (validationResult.userWantsToSkip) {
    return handleSkipRequest(question, step, isLastQuestion);
  }

  // PRIORITY 3: Handle safety issues
  if (validationResult.hasSafetyIssue) {
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY_LONG)],
      step,
      waitingForSafetyAck: true,
    };
  }

  // PRIORITY 4: Handle irrelevant response
  if (!validationResult.isRelevant) {
    return {
      messages: [new AIMessage(validationResult.errorMessage || "")],
      step,
    };
  }

  // PRIORITY 5: Delegate to question-specific handler
  const handlerResult = await executeQuestionHandler(
    question,
    userInput,
    validationResult,
    state,
    step
  );

  if (handlerResult) {
    return handlerResult;
  }

  // FALLBACK: Handle last question or regular progression
  if (isLastQuestion) {
    return {
      step: step + 1,
      isComplete: true,
      messages: [
        new AIMessage(buildMessage(validationResult, undefined, undefined)),
      ],
    };
  }

  // Default: advance to next step
  return {
    step: step + 1,
    messages: [
      new AIMessage(
        buildMessage(
          validationResult,
          undefined,
          ONBOARDING_QUESTIONS[step + 1]
        )
      ),
    ],
  };
}

/**
 * Handle skip request: only allow if last question or optional
 */
function handleSkipRequest(
  question: OnboardingQuestion,
  step: number,
  isLastQuestion: boolean
): Partial<OnboardingStateType> {
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

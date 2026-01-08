import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../../state";
import type { OnboardingQuestion } from "@/types/onboarding";
import type { ValidationResult } from "../../../tools/validation";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

/**
 * Type definition for handler functions
 */
export type QuestionHandler = (
  question: OnboardingQuestion,
  userInput: string,
  validationResult: ValidationResult,
  state: OnboardingStateType,
  step: number
) => Partial<OnboardingStateType> | null;

/** Default acknowledgment message */
const DEFAULT_ACK = "Thank you for sharing!";

/**
 * Helper: Get question index by key
 */
export function getQuestionIndexByKey(key: string): number {
  return ONBOARDING_QUESTIONS.findIndex((q) => q.key === key);
}

/**
 * Helper: Check if a step index corresponds to the last onboarding question
 */
export function isLastQuestionIndex(step: number): boolean {
  return step === ONBOARDING_QUESTIONS.length - 1;
}

/**
 * Helper: Build state update with default values
 */
export function buildStateUpdate(
  responses: Record<string, string>,
  messages: AIMessage[],
  step: number,
  extras?: Partial<OnboardingStateType>
): Partial<OnboardingStateType> {
  return {
    responses,
    messages,
    step,
    ...extras,
  };
}

/**
 * Helper: Get follow-up for a given key and user input
 */
export function getFollowUp(
  question: OnboardingQuestion,
  userInput?: string
): { text: string; nextKey: string } | null {
  if (!question.followUps) return null;

  if (userInput && question.followUps[userInput]) {
    return question.followUps[userInput];
  }

  return question.followUps.default || null;
}

/**
 * Helper: Get next step from followUp nextKey, fallback to step + 1
 */
export function getNextStep(
  followUp: { nextKey: string } | null,
  currentStep: number
): number {
  if (!followUp) return currentStep + 1;

  const nextIndex = getQuestionIndexByKey(followUp.nextKey);
  return nextIndex !== -1 ? nextIndex : currentStep + 1;
}

/**
 * Helper: Check if user selected a predefined option
 */
export function getSelectedOption(
  question: OnboardingQuestion,
  userInput: string
): string | null {
  if (!question.options) return null;

  return (
    question.options.find(
      (opt) => opt.toLowerCase() === userInput.toLowerCase()
    ) || null
  );
}

/**
 * Helper: Build message combining LLM ack + follow-up text
 * Only use DEFAULT_ACK if no other content is available
 */
export function buildMessage(
  validationResult: ValidationResult,
  followUpText?: string,
  nextQuestion?: OnboardingQuestion
): string {
  let message = "";

  // Add LLM-provided follow-up text if available
  if (validationResult.followUpText?.trim()) {
    message = validationResult.followUpText;
  }

  // Add any additional follow-up text (from hardcoded follow-ups) only when LLM did not provide followUpText
  if (followUpText?.trim() && !validationResult.followUpText?.trim()) {
    message = message ? `${message}\n\n${followUpText}` : followUpText;
  }

  // Add next question text only if no question is already present in the message
  if (nextQuestion?.text) {
    const hasQuestion = /\?/.test(message);
    if (!hasQuestion) {
      message = message
        ? `${message}\n\n${nextQuestion.text}`
        : nextQuestion.text;
    } else {
      // If message already contains a question, prefer the LLM/follow-up wording and skip generic nextQuestion text
      message = message;
    }
  }

  // Only use DEFAULT_ACK if absolutely no content
  if (!message.trim()) {
    message = DEFAULT_ACK;
  }

  return message;
}

/**
 * Generic handler for simple questions with optional follow-ups
 * Handles most common pattern: store response, get follow-up, advance step
 */
export function createSimpleHandler(
  responseTransformer?: (
    userInput: string,
    state: OnboardingStateType
  ) => Record<string, string>
): QuestionHandler {
  return (question, userInput, validationResult, state, step) => {
    const followUp = getFollowUp(question);
    const nextStepValue = getNextStep(followUp, step);
    const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];

    const message = buildMessage(
      validationResult,
      followUp?.text,
      nextQuestion
    );

    const responses = responseTransformer
      ? responseTransformer(userInput, state)
      : { [question.key]: userInput };

    return buildStateUpdate(responses, [new AIMessage(message)], nextStepValue);
  };
}

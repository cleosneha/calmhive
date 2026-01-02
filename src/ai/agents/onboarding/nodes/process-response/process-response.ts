import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { handleReadinessCheck } from "./readiness-check";
import { handleSafetyAcknowledgment } from "./safety-acknowledgment";
import { isPredefinedOption } from "./option-detection";
import { handleCustomResponse } from "./custom-response";
import { handlePredefinedOptionStorage } from "./option-storage";
import { handleEmptyResponse } from "./empty-response";

// Process response node: Handle user input and update state accordingly
export async function processResponseNode(
  state: OnboardingStateType
): Promise<Partial<OnboardingStateType>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const userInput =
    lastMessage &&
    "content" in lastMessage &&
    typeof lastMessage.content === "string"
      ? lastMessage.content.trim()
      : "";

  // Get current question
  const questionIndex = state.step;
  const question =
    questionIndex >= 0 && questionIndex < ONBOARDING_QUESTIONS.length
      ? ONBOARDING_QUESTIONS[questionIndex]
      : null;

  // Handle safety acknowledgment (moved to separate module)
  const safetyResult = handleSafetyAcknowledgment(state, userInput);
  if (safetyResult) return safetyResult;

  // Check if this is a predefined option first (to avoid unnecessary LLM calls)
  const isPredefined =
    question && isPredefinedOption(question, userInput, state);

  // Handle readiness check ONLY for custom responses (not predefined options)
  if (!isPredefined) {
    const readinessResult = await handleReadinessCheck(state, userInput);
    if (readinessResult) return readinessResult;
  }

  // Handle custom responses (moved to separate module)
  if (question && !isPredefined && userInput.length > 0) {
    const customResult = await handleCustomResponse(
      question,
      userInput,
      state.step,
      state
    );
    if (customResult) return customResult;
  }

  // Handle predefined option storage (moved to separate module)
  if (question && isPredefined) {
    const optionStorageResult = handlePredefinedOptionStorage(
      question,
      userInput,
      state.step,
      state
    );
    if (optionStorageResult) return optionStorageResult;
  }

  // Handle empty response for optional questions (moved to separate module)
  let emptyResponseResult: Partial<OnboardingStateType> | null = null;
  if (question) {
    emptyResponseResult = handleEmptyResponse(question, userInput, state.step);
    if (emptyResponseResult) return emptyResponseResult;
  }

  // Default: keep same step
  return {
    step: state.step,
  };
}

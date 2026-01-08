import { AIMessage } from "@langchain/core/messages";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { QuestionHandler } from "./utils";
import {
  buildStateUpdate,
  getNextStep,
  buildMessage,
  getSelectedOption,
} from "./utils";

/**
 * General handler for questions with follow-ups
 * Handles both hardcoded options and custom text
 * Used for: stressAspect, habitArea, sleepChallenge, daysOff, etc.
 */
export const handleGeneralResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  if (!question.followUps || Object.keys(question.followUps).length === 0) {
    return null;
  }

  // Check if user selected a hardcoded option
  const selectedOption = getSelectedOption(question, userInput);

  const followUpToUse =
    selectedOption && question.followUps[selectedOption]
      ? question.followUps[selectedOption]
      : question.followUps.default;

  if (!followUpToUse) return null;

  const nextStepValue = getNextStep(followUpToUse, step);
  const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];
  const message = buildMessage(
    validationResult,
    followUpToUse.text,
    nextQuestion
  );

  return buildStateUpdate(
    { [question.key]: userInput },
    [new AIMessage(message)],
    nextStepValue
  );
};

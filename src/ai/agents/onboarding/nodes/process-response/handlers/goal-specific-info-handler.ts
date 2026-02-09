import { AIMessage } from "@langchain/core/messages";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { QuestionHandler } from "./utils";
import {
  buildStateUpdate,
  getFollowUp,
  getNextStep,
  buildMessage,
} from "./utils";

/**
 * Handle goal-specific-info response: store dynamic goal-specific answer
 */
export const handleGoalSpecificInfoResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  state,
  step,
) => {
  if (!state.currentGoalSpecificQuestion) return null;

  const goalSpecificData = {
    question: state.currentGoalSpecificQuestion,
    answer: userInput,
  };

  const followUp = getFollowUp(question);
  if (!followUp) return null;

  const nextStepValue = getNextStep(followUp, step);
  const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];

  // For goal-specific info, use simple hardcoded followUp.text (no LLM followUpText)
  // This ensures clean transition to next question without extra AI-generated questions
  const simpleValidationResult = {
    ...validationResult,
    followUpText: undefined, // Remove LLM-generated follow-up
  };

  const message = buildMessage(
    simpleValidationResult,
    followUp.text,
    nextQuestion,
  );

  return buildStateUpdate(
    { [question.key]: JSON.stringify(goalSpecificData) },
    [new AIMessage(message)],
    nextStepValue,
    { currentGoalOptions: [], currentGoalSpecificQuestion: undefined },
  );
};

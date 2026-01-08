import { AIMessage } from "@langchain/core/messages";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { QuestionHandler } from "./utils";
import {
  buildStateUpdate,
  getFollowUp,
  getNextStep,
  buildMessage,
  getSelectedOption,
} from "./utils";

/**
 * Handle goals response: check for hardcoded option or extract custom goals
 */
export const handleGoalsResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  // Check if user selected a hardcoded option
  const selectedOption = getSelectedOption(question, userInput);

  if (selectedOption) {
    // Hardcoded option selected - use its specific follow-up
    const followUp = getFollowUp(question, selectedOption);
    if (!followUp) return null;

    const nextStepValue = getNextStep(followUp, step);
    const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];
    const message = buildMessage(
      { ...validationResult, followUpText: followUp.text },
      undefined,
      nextQuestion
    );

    return buildStateUpdate(
      { [question.key]: userInput },
      [new AIMessage(message)],
      nextStepValue
    );
  }

  // Custom text - extract goals and show goalSpecificInfo
  if (validationResult.goalOptions && validationResult.goalOptions.length > 0) {
    let followUp =
      validationResult.followUpText || "Thank you for sharing that goal.";

    if (validationResult.goalSpecificQuestion) {
      followUp += `\n\n${validationResult.goalSpecificQuestion}`;
    }

    const defaultFollowUp = getFollowUp(question);
    const nextStepValue = getNextStep(defaultFollowUp, step);
    const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];

    const message = buildMessage(
      { ...validationResult, followUpText: followUp },
      undefined,
      nextQuestion
    );

    return buildStateUpdate(
      { [question.key]: userInput },
      [new AIMessage(message)],
      nextStepValue,
      {
        currentGoalOptions: validationResult.goalOptions,
        currentGoalSpecificQuestion: validationResult.goalSpecificQuestion,
      }
    );
  }

  return null;
};

import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

/**
 * Node: Ask Current Question
 * Presents the current question based on step
 * If there's a previous response, use the follow-up acknowledgment
 */
export async function askQuestionNode(state: OnboardingStateType) {
  const questionIndex = state.step;

  if (questionIndex < 0 || questionIndex >= ONBOARDING_QUESTIONS.length) {
    return {}; // Should not happen
  }

  const question = ONBOARDING_QUESTIONS[questionIndex];
  let prompt = "";

  // Check if we have a previous response and a matching follow-up
  if (questionIndex > 0) {
    const previousQuestion = ONBOARDING_QUESTIONS[questionIndex - 1];
    const previousResponse = state.responses[previousQuestion.key];

    // Check if the previous response matches a predefined option
    if (previousQuestion.followUps && previousResponse) {
      const followUp =
        previousQuestion.followUps[previousResponse] ||
        previousQuestion.followUps["default"];

      if (followUp && followUp.nextKey === question.key) {
        // Use the predefined follow-up text if it exists and is not empty
        // Replace {response} with the user's previous response
        if (followUp.text && followUp.text.trim() !== "") {
          prompt = followUp.text.replace("{response}", previousResponse);
        } else {
          // If follow-up text is empty, just show the question
          prompt = question.text;
        }
      } else {
        // Custom response - just use the question text
        prompt = question.text;
      }
    } else {
      prompt = question.text;
    }
  } else {
    // First question or no previous response
    prompt = question.text;
  }

  // For goal-related questions, use dynamic options if available
  // For goalSpecificInfo, set dynamic options
  if (question.key === "goalSpecificInfo") {
    // Dynamically update options for goalSpecificInfo
    if (state.currentGoalOptions && state.currentGoalOptions.length > 0) {
      // Inject options into the question object for rendering
      (question as typeof question & { options?: string[] }).options =
        state.currentGoalOptions;
    }
  }

  if (!question.required) {
    prompt += "\n\n(This one is totally optional — you can skip.)";
  }

  return {
    messages: [new AIMessage(prompt)],
  };
}

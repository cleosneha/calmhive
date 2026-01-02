import { OnboardingQuestion } from "@/types";
import type { OnboardingStateType } from "../../state";

/**
 * Check if response is a predefined option
 */
export function isPredefinedOption(
  question: OnboardingQuestion,
  userInput: string,
  state: OnboardingStateType
): boolean {
  if (!question) return false;

  return (
    question.options.some(
      (option: string) => option.toLowerCase() === userInput.toLowerCase()
    ) ||
    (question.key === "goalSpecificInfo" &&
      state.currentGoalOptions &&
      state.currentGoalOptions.some(
        (option: string) => option.toLowerCase() === userInput.toLowerCase()
      ))
  );
}

import { OnboardingQuestion } from "@/types";
import type { OnboardingStateType } from "../../state";

/**
 * Check if response is a predefined option
 * Handles both single options and comma-separated multi-select options
 */
export function isPredefinedOption(
  question: OnboardingQuestion,
  userInput: string,
  state: OnboardingStateType,
): boolean {
  if (!question) return false;

  const normalizedInput = userInput.toLowerCase().trim();

  // Check single option match
  const isSingleOption = question.options.some(
    (option: string) => option.toLowerCase() === normalizedInput,
  );

  // For multiSelect questions, also check comma-separated or "and"-separated options
  const isMultiSelectMatch =
    question.multiSelect &&
    (normalizedInput.includes(",") || normalizedInput.includes(" and ")) &&
    normalizedInput
      .split(/,| and /i) // Split by comma or " and "
      .map((part) => part.trim())
      .filter((part) => part.length > 0) // Remove empty parts
      .every((part) =>
        question.options.some((opt: string) => opt.toLowerCase() === part),
      );

  // Check dynamic goal options
  const isGoalOption =
    question.key === "goalSpecificInfo" &&
    state.currentGoalOptions &&
    state.currentGoalOptions.some(
      (option: string) => option.toLowerCase() === normalizedInput,
    );

  return isSingleOption || isMultiSelectMatch || isGoalOption;
}

import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { performLLMValidation } from "../../utils/llm-validator";
import {
  validateAndCreateDate,
  formatDateToDDMMYYYY,
  calculateAge,
  mapAgeToRange,
} from "../../utils/dob-validator";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";
import { getQuestionIndexByKey } from "./handlers/utils";

/**
 * Handle DOB format/year clarification globally
 * Runs before any question-specific processing to handle DOB modification flow
 */
export async function handleDOBClarification(
  state: OnboardingStateType,
  userInput: string,
): Promise<Partial<OnboardingStateType> | null> {
  // PRIORITY 1: Handle full year clarification
  if (state.waitingForFullYear && state.partialDateInput) {
    return handleFullYearClarification(state, userInput);
  }

  // PRIORITY 2: Handle format clarification (DD/MM or MM/DD)
  if (state.waitingForDateFormat && state.tentativeDateInput) {
    return handleFormatClarification(state, userInput);
  }

  return null;
}

/**
 * Handle user providing full 4-digit year
 */
async function handleFullYearClarification(
  state: OnboardingStateType,
  userInput: string,
): Promise<Partial<OnboardingStateType>> {
  // console.log("[DOB Clarification] Processing full year clarification");

  // Extract 4-digit year from user input
  const yearMatch = userInput.match(/\b(19\d{2}|20\d{2})\b/);

  if (!yearMatch) {
    return {
      messages: [
        new AIMessage(
          `I need the full 4-digit year for the date ${state.partialDateInput}. Please provide just the year (e.g., 1990, 2004, 2010).`,
        ),
      ],
      step: state.step,
      waitingForFullYear: true,
      partialDateInput: state.partialDateInput,
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  const fullYear = yearMatch[1];

  // Reconstruct full date from partial date
  const partialPattern = /^(\d{1,2})([\\/\-\.])(\d{1,2})\2(\d{2})$/;
  const match = state.partialDateInput.match(partialPattern);

  if (!match) {
    return {
      messages: [
        new AIMessage(
          "Sorry, I had trouble processing that. Could you enter the full date again? (e.g., 08/07/2004)",
        ),
      ],
      step: state.step,
      waitingForFullYear: false,
      partialDateInput: "",
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  // Reconstruct: part1 + separator + part2 + separator + full year
  const fullDate = `${match[1]}${match[2]}${match[3]}${match[2]}${fullYear}`;
  // console.log("[DOB Clarification] Reconstructed date:", fullDate);

  // Check for ambiguity in the reconstructed date
  const part1 = parseInt(match[1], 10);
  const part2 = parseInt(match[3], 10);

  // If both parts <= 12, it's ambiguous
  if (part1 <= 12 && part2 <= 12) {
    return {
      messages: [
        new AIMessage(
          `I see the date ${fullDate}, but the format is a bit ambiguous. Could you clarify:\n\nIs this in DD/MM/YYYY format or MM/DD/YYYY format?\n\nFor example:\n• DD/MM/YYYY (Day/Month/Year)\n• MM/DD/YYYY (Month/Day/Year)`,
        ),
      ],
      step: state.step,
      waitingForFullYear: false,
      partialDateInput: "",
      waitingForDateFormat: true,
      tentativeDateInput: fullDate,
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  // Not ambiguous - parse directly
  let day: number, month: number;
  if (part1 > 12) {
    day = part1;
    month = part2;
  } else {
    month = part1;
    day = part2;
  }

  return finalizeAndStoreDOB(day, month, parseInt(fullYear, 10), state);
}

/**
 * Handle user clarifying date format (DD/MM/YYYY or MM/DD/YYYY)
 */
async function handleFormatClarification(
  state: OnboardingStateType,
  userInput: string,
): Promise<Partial<OnboardingStateType>> {
  // console.log("[DOB Clarification] Processing format clarification");

  const result = await performLLMValidation(
    userInput,
    state.tentativeDateInput,
    "",
    "date_format_clarification",
  );

  // console.log("[DOB Clarification] Format result:", result);

  // PRIORITY 1: Check for safety issues
  if (result.hasSafetyIssue) {
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY_LONG)],
      step: state.step,
      waitingForSafetyAck: true,
      waitingForDateFormat: false,
      tentativeDateInput: "",
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  // PRIORITY 2: Check relevance (only if not providing clarification)
  if (
    !result.isRelevant &&
    !result.clarification &&
    !result.modificationRequired
  ) {
    return {
      messages: [
        new AIMessage(
          `I need you to specify the date format clearly. Is "${state.tentativeDateInput}" in:\n• DD/MM/YYYY (Day/Month/Year), or\n• MM/DD/YYYY (Month/Day/Year)?`,
        ),
      ],
      step: state.step,
      waitingForDateFormat: true,
      tentativeDateInput: state.tentativeDateInput,
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  // PRIORITY 3: If no clarification provided
  if (!result.clarification || !result.dateFormat) {
    return {
      messages: [
        new AIMessage(
          `I need you to specify the date format clearly. Is "${state.tentativeDateInput}" in:\n• DD/MM/YYYY (Day/Month/Year), or\n• MM/DD/YYYY (Month/Day/Year)?`,
        ),
      ],
      step: state.step,
      waitingForDateFormat: true,
      tentativeDateInput: state.tentativeDateInput,
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  // Parse the original date with specified format
  const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/;
  const match = state.tentativeDateInput.match(datePattern);

  if (!match) {
    return {
      messages: [
        new AIMessage(
          "Sorry, I lost track of your date. Could you enter it again?",
        ),
      ],
      step: state.step,
      waitingForDateFormat: false,
      tentativeDateInput: "",
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  const part1 = parseInt(match[1], 10);
  const part2 = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  let day: number, month: number;
  if (result.dateFormat === "DD/MM/YYYY") {
    day = part1;
    month = part2;
  } else {
    month = part1;
    day = part2;
  }

  return finalizeAndStoreDOB(day, month, year, state);
}

/**
 * Validate and store DOB, then proceed to next question
 */
function finalizeAndStoreDOB(
  day: number,
  month: number,
  year: number,
  state: OnboardingStateType,
): Partial<OnboardingStateType> {
  const validation = validateAndCreateDate(day, month, year);

  if (!validation.valid) {
    return {
      messages: [
        new AIMessage(validation.error || HARD_CODED_MESSAGES.DOB_INVALID),
      ],
      step: state.step,
      waitingForDateFormat: false,
      tentativeDateInput: "",
      waitingForFullYear: false,
      partialDateInput: "",
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    };
  }

  const dobString = formatDateToDDMMYYYY(validation.date!);
  const age = calculateAge(validation.date!);
  const ageRange = mapAgeToRange(age);

  // console.log( "[DOB Clarification] Valid DOB:", dobString, "Age range:", ageRange);

  // Get DOB question to find follow-up based on age range
  const dobQuestion = ONBOARDING_QUESTIONS.find((q) => q.key === "dateOfBirth");
  const followUp =
    dobQuestion?.followUps?.[ageRange] || dobQuestion?.followUps?.default;

  // Calculate next step
  let nextStep = state.step + 1;
  if (followUp?.nextKey) {
    const nextIndex = getQuestionIndexByKey(followUp.nextKey);
    if (nextIndex !== -1) {
      nextStep = nextIndex;
    }
  }

  // Build acknowledgment + follow-up text
  const message = `Got it! I've noted your date of birth. 🤍\n\n${followUp?.text || "Let's continue!"}`;

  return {
    responses: { dateOfBirth: dobString },
    messages: [new AIMessage(message)],
    step: nextStep,
    waitingForDateFormat: false,
    tentativeDateInput: "",
    waitingForFullYear: false,
    partialDateInput: "",
    // Clear options since we're advancing to next question
    currentGoalOptions: [],
    currentGoalSpecificQuestion: "",
  };
}

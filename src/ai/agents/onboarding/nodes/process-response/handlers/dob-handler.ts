import { AIMessage } from "@langchain/core/messages";
import { formatDateToDDMMYYYY } from "@/ai/agents/onboarding/utils/dob-validator";
import { HARD_CODED_MESSAGES } from "../../../utils/hardcoded-messages";
import type { QuestionHandler } from "./utils";
import type { OnboardingStateType } from "../../../state";
import {
  buildStateUpdate,
  getFollowUp,
  getNextStep,
  buildMessage,
} from "./utils";
import { performLLMValidation } from "@/ai/agents/onboarding/utils/llm-validator";

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dateOfBirth.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Map age to age range
 */
function mapAgeToRange(age: number): string {
  if (age < 18) return "Under 18";
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  if (age >= 55) return "55+";

  return "Unknown";
}

/**
 * Validate date components and create Date object
 */
function validateAndCreateDate(
  day: number,
  month: number,
  year: number,
): { valid: boolean; date?: Date; error?: string } {
  const currentYear = new Date().getUTCFullYear();

  // Validate ranges
  if (day < 1 || day > 31) {
    return { valid: false, error: "Day must be between 1 and 31." };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: "Month must be between 1 and 12." };
  }

  if (year < 1900 || year > currentYear) {
    return {
      valid: false,
      error: `Year must be between 1900 and ${currentYear}.`,
    };
  }

  // Check day validity for month (including leap year)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return {
      valid: false,
      error: `${monthNames[month - 1]} ${year} has only ${daysInMonth} days.`,
    };
  }

  const dateOfBirth = new Date(Date.UTC(year, month - 1, day));

  // Check if future date
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (dateOfBirth > today) {
    return {
      valid: false,
      error: "Date of birth cannot be in the future.",
    };
  }

  // Calculate and validate age
  const age = calculateAge(dateOfBirth);

  if (age < 4) {
    return {
      valid: false,
      error: "You must be at least 4 years old to use CalmHive.",
    };
  }

  if (age > 110) {
    return {
      valid: false,
      error:
        "Please enter a valid date of birth. The age seems unusually high.",
    };
  }

  return { valid: true, date: dateOfBirth };
}

/**
 * Handle date of birth response with single LLM validation
 */
export const handleDateOfBirthResponse: QuestionHandler = async (
  question,
  userInput,
  validationResult,
  state: OnboardingStateType,
  step,
) => {
  console.log("[DOB Handler] Starting with input:", userInput);
  console.log(
    "[DOB Handler] State waiting for format:",
    state.waitingForDateFormat,
  );

  // Check if we're waiting for format clarification
  if (state.waitingForDateFormat && state.tentativeDateInput) {
    console.log("[DOB Handler] Processing format clarification");

    try {
      const result = await performLLMValidation(
        userInput,
        state.tentativeDateInput,
        "",
        "date_format_clarification",
      );

      console.log("[DOB Handler] Format clarification result:", result);

      // Check if modifying another field
      if (
        result.modificationRequired &&
        result.modifiedField &&
        result.modifiedValue
      ) {
        console.log("[DOB Handler] User modifying:", result.modifiedField);
        return buildStateUpdate(
          {
            [result.modifiedField]: result.modifiedValue,
          },
          [
            new AIMessage(
              `Got it! I've updated your ${result.modifiedField}. Now, back to your date of birth - please clarify: is "${state.tentativeDateInput}" in DD/MM/YYYY format or MM/DD/YYYY format?`,
            ),
          ],
          step,
          {
            waitingForDateFormat: true,
            tentativeDateInput: state.tentativeDateInput,
          },
        );
      }

      // If no clarification provided
      if (!result.clarification || !result.dateFormat) {
        return buildStateUpdate(
          {},
          [
            new AIMessage(
              `I need you to specify the date format clearly. Is "${state.tentativeDateInput}" in:\n• DD/MM/YYYY (Day/Month/Year), or\n• MM/DD/YYYY (Month/Day/Year)?`,
            ),
          ],
          step,
          {
            waitingForDateFormat: true,
            tentativeDateInput: state.tentativeDateInput,
          },
        );
      }

      // Parse the original date with specified format
      const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
      const match = state.tentativeDateInput.match(datePattern);

      if (!match) {
        return buildStateUpdate(
          {},
          [
            new AIMessage(
              "Sorry, I lost track of your date. Could you enter it again?",
            ),
          ],
          step,
          {
            waitingForDateFormat: false,
            tentativeDateInput: "",
          },
        );
      }

      const part1 = parseInt(match[1], 10);
      const part2 = parseInt(match[2], 10);
      const part3 = parseInt(match[3], 10);

      let day: number, month: number, year: number;

      if (result.dateFormat === "DD/MM/YYYY") {
        day = part1;
        month = part2;
        year = part3;
      } else {
        month = part1;
        day = part2;
        year = part3;
      }

      // Validate and create date
      const validation = validateAndCreateDate(day, month, year);

      if (!validation.valid) {
        return buildStateUpdate(
          {},
          [new AIMessage(validation.error || HARD_CODED_MESSAGES.DOB_INVALID)],
          step,
          {
            waitingForDateFormat: false,
            tentativeDateInput: "",
          },
        );
      }

      const age = calculateAge(validation.date!);
      const ageRange = mapAgeToRange(age);
      const followUp = getFollowUp(question, ageRange);
      const nextStepValue = getNextStep(followUp, step);
      const message = buildMessage(validationResult, followUp?.text);
      const dobString = formatDateToDDMMYYYY(validation.date!);

      console.log("[DOB Handler] Format clarified, storing DOB:", dobString);

      return buildStateUpdate(
        {
          [question.key]: dobString,
        },
        [new AIMessage(message)],
        nextStepValue,
        {
          waitingForDateFormat: false,
          tentativeDateInput: "",
        },
      );
    } catch (error) {
      console.error("[DOB Handler] LLM error during clarification:", error);
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "Sorry, I had trouble processing that. Please clarify: DD/MM/YYYY or MM/DD/YYYY?",
          ),
        ],
        step,
        {
          waitingForDateFormat: true,
          tentativeDateInput: state.tentativeDateInput,
        },
      );
    }
  }

  // Normal DOB validation using LLM
  console.log("[DOB Handler] Validating DOB with LLM");

  try {
    const result = await performLLMValidation(
      userInput,
      question.text,
      "",
      "date_of_birth",
    );

    console.log("[DOB Handler] DOB validation result:", result);

    // Check if modifying another field
    if (
      result.modificationRequired &&
      result.modifiedField &&
      result.modifiedValue
    ) {
      console.log("[DOB Handler] User modifying:", result.modifiedField);
      return buildStateUpdate(
        {
          [result.modifiedField]: result.modifiedValue,
        },
        [
          new AIMessage(
            `Got it! I've updated your ${result.modifiedField}. Now, could you please share your date of birth?`,
          ),
        ],
        step,
      );
    }

    // Handle different statuses
    if (result.dobStatus === "AMBIGUOUS") {
      console.log("[DOB Handler] Ambiguous format detected");
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            `I see a date, but the format is a bit ambiguous. Could you clarify:\n\nIs this in DD/MM/YYYY format or MM/DD/YYYY format?\n\nFor example:\n• DD/MM/YYYY (Day/Month/Year)\n• MM/DD/YYYY (Month/Day/Year)`,
          ),
        ],
        step,
        {
          waitingForDateFormat: true,
          tentativeDateInput: userInput,
        },
      );
    }

    if (result.dobStatus === "NEEDS_FULL_YEAR") {
      console.log("[DOB Handler] Needs full year");
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "Could you please enter the full 4-digit year? For example, 1990 instead of 90.",
          ),
        ],
        step,
      );
    }

    if (result.dobStatus === "INVALID") {
      console.log("[DOB Handler] Invalid date:", result.dobError);
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            result.dobError ||
              "I couldn't understand that date format. Could you try again? For example: 15/03/1990 or 21st October 2023",
          ),
        ],
        step,
      );
    }

    // Status is VALID - validate the parsed date
    if (!result.day || !result.month || !result.year) {
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "I couldn't parse that date. Please try a format like 15/03/1990 or 21st October 2023",
          ),
        ],
        step,
      );
    }

    const validation = validateAndCreateDate(
      result.day,
      result.month,
      result.year,
    );

    if (!validation.valid) {
      console.log("[DOB Handler] Date validation failed:", validation.error);
      return buildStateUpdate(
        {},
        [new AIMessage(validation.error || HARD_CODED_MESSAGES.DOB_INVALID)],
        step,
      );
    }

    // Success - calculate age and store
    const age = calculateAge(validation.date!);
    const ageRange = mapAgeToRange(age);
    const followUp = getFollowUp(question, ageRange);
    const nextStepValue = getNextStep(followUp, step);
    const message = buildMessage(validationResult, followUp?.text);
    const dobString = formatDateToDDMMYYYY(validation.date!);

    console.log("[DOB Handler] Valid DOB, storing:", dobString);

    return buildStateUpdate(
      { [question.key]: dobString },
      [new AIMessage(message)],
      nextStepValue,
    );
  } catch (error) {
    console.error("[DOB Handler] LLM error:", error);
    return buildStateUpdate(
      {},
      [
        new AIMessage(
          "Sorry, I had trouble processing that. Could you try entering your date of birth again?",
        ),
      ],
      step,
    );
  }
};

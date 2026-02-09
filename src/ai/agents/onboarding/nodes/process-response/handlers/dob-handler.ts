import { AIMessage } from "@langchain/core/messages";
import {
  formatDateToDDMMYYYY,
  validateAndCreateDate,
  calculateAge,
  mapAgeToRange,
} from "@/ai/agents/onboarding/utils/dob-validator";
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
 * Type for successful DOB validation result
 */
type DOBValidationSuccess = {
  dobString: string;
  validDate: Date;
};

/**
 * Validate DOB input using LLM - Reusable for both initial entry and modifications
 * Returns state update for ambiguity, validation errors, or success with parsed date
 * @param skipModificationCheck - Skip checking for field modifications (used when validating reconstructed dates)
 */
export async function validateDOBWithLLM(
  userInput: string,
  currentStep: number,
  skipModificationCheck: boolean = false,
): Promise<Partial<OnboardingStateType> | DOBValidationSuccess | null> {
  try {
    const result = await performLLMValidation(
      userInput,
      "What is your date of birth?",
      "",
      "date_of_birth",
    );

    console.log("[DOB Validation] LLM result:", result);

    // PRIORITY 1: Check for safety issues FIRST
    if (result.hasSafetyIssue) {
      console.log("[DOB Validation] Safety issue detected");
      return buildStateUpdate(
        {},
        [new AIMessage(HARD_CODED_MESSAGES.SAFETY_LONG)],
        currentStep,
        {
          waitingForSafetyAck: true,
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    // PRIORITY 2: Check relevance (only if not modifying and not a valid date)
    if (
      !skipModificationCheck &&
      !result.isRelevant &&
      !result.modificationRequired &&
      result.dobStatus === "INVALID"
    ) {
      console.log("[DOB Validation] Irrelevant response");
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "That doesn't seem related to your date of birth. Could you please provide your birth date? For example: 15/03/1990",
          ),
        ],
        currentStep,
        {
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    // PRIORITY 3: Check if modifying another field (skip if this is a reconstructed date validation)
    // Also ignore "YEAR" as it's likely a false positive from date parsing
    if (
      !skipModificationCheck &&
      result.modificationRequired &&
      result.modifiedField &&
      result.modifiedField !== "dateOfBirth" &&
      result.modifiedField.toLowerCase() !== "year" &&
      result.modifiedValue
    ) {
      console.log(
        "[DOB Validation] User modifying other field:",
        result.modifiedField,
      );
      return buildStateUpdate(
        {
          [result.modifiedField]: result.modifiedValue,
        },
        [
          new AIMessage(
            `Got it! I've updated your ${result.modifiedField}. Now, could you please confirm your date of birth?`,
          ),
        ],
        currentStep,
      );
    }

    // Handle ambiguity
    if (result.dobStatus === "AMBIGUOUS") {
      console.log("[DOB Validation] Ambiguous format detected");
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            `I see a date, but the format is a bit ambiguous. Could you clarify:\n\nIs this in DD/MM/YYYY format or MM/DD/YYYY format?\n\nFor example:\n• DD/MM/YYYY (Day/Month/Year)\n• MM/DD/YYYY (Month/Day/Year)`,
          ),
        ],
        currentStep,
        {
          waitingForDateFormat: true,
          tentativeDateInput: userInput,
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    if (result.dobStatus === "NEEDS_FULL_YEAR") {
      console.log("[DOB Validation] Needs full year");
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "Could you please provide the full 4-digit year? For example, 2004 instead of 04.",
          ),
        ],
        currentStep,
        {
          waitingForFullYear: true,
          partialDateInput: userInput,
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    if (result.dobStatus === "INVALID") {
      console.log("[DOB Validation] Invalid date:", result.dobError);
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            result.dobError ||
              "I couldn't understand that date format. Could you try again? For example: 15/03/1990 or 21st October 2023",
          ),
        ],
        currentStep,
        {
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    // Status is VALID - but perform fallback ambiguity check for numeric dates
    if (!result.day || !result.month || !result.year) {
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            "I couldn't parse that date. Please try a format like 15/03/1990 or 21st October 2023",
          ),
        ],
        currentStep,
        {
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    // Fallback ambiguity check: if input is numeric format and both parts ≤12, force clarification
    // This ensures ambiguity is always detected even if LLM misses it
    const numericPattern = /^\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s*$/;
    const numericMatch = userInput.match(numericPattern);
    if (
      !skipModificationCheck &&
      numericMatch &&
      parseInt(numericMatch[1], 10) <= 12 &&
      parseInt(numericMatch[2], 10) <= 12
    ) {
      console.log(
        "[DOB Validation] Fallback ambiguity check triggered for:",
        userInput,
      );
      return buildStateUpdate(
        {},
        [
          new AIMessage(
            `I see a date, but the format is a bit ambiguous. Could you clarify:\n\nIs this in DD/MM/YYYY format or MM/DD/YYYY format?\n\nFor example:\n• DD/MM/YYYY (Day/Month/Year)\n• MM/DD/YYYY (Month/Day/Year)`,
          ),
        ],
        currentStep,
        {
          waitingForDateFormat: true,
          tentativeDateInput: userInput,
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    const validation = validateAndCreateDate(
      result.day,
      result.month,
      result.year,
    );

    if (!validation.valid) {
      console.log("[DOB Validation] Date validation failed:", validation.error);
      return buildStateUpdate(
        {},
        [new AIMessage(validation.error || HARD_CODED_MESSAGES.DOB_INVALID)],
        currentStep,
        {
          currentGoalOptions: [],
          currentGoalSpecificQuestion: "",
        },
      );
    }

    // Success - return the formatted DOB string and date object for age calculation
    const dobString = formatDateToDDMMYYYY(validation.date!);
    console.log("[DOB Validation] Valid DOB:", dobString);
    return {
      dobString,
      validDate: validation.date!,
    };
  } catch (error) {
    console.error("[DOB Validation] LLM error:", error);
    return buildStateUpdate(
      {},
      [
        new AIMessage(
          "Sorry, I had trouble processing that. Could you try entering your date of birth again?",
        ),
      ],
      currentStep,
      {
        currentGoalOptions: [],
        currentGoalSpecificQuestion: "",
      },
    );
  }
}

/**
 * Handle date of birth response with single LLM validation
 * Note: Format/year clarification is handled globally by dob-clarification.ts in process-response.ts
 * This handler only processes initial DOB input
 */
export const handleDateOfBirthResponse: QuestionHandler = async (
  question,
  userInput,
  validationResult,
  _state: OnboardingStateType,
  step,
) => {
  console.log("[DOB Handler] Starting with input:", userInput);

  // Use the shared validation function for initial DOB entry
  console.log("[DOB Handler] Validating DOB with LLM");

  const dobValidation = await validateDOBWithLLM(userInput, step);

  // If validation returned error or ambiguity state, return it
  if (dobValidation && "messages" in dobValidation) {
    return dobValidation;
  }

  // If validation succeeded, store DOB and proceed
  if (
    dobValidation &&
    "dobString" in dobValidation &&
    dobValidation.dobString
  ) {
    const age = calculateAge(dobValidation.validDate);
    const ageRange = mapAgeToRange(age);
    const followUp = getFollowUp(question, ageRange);
    const nextStepValue = getNextStep(followUp, step);
    const message = buildMessage(validationResult, followUp?.text);

    console.log("[DOB Handler] Valid DOB, storing:", dobValidation.dobString);

    return buildStateUpdate(
      { [question.key]: dobValidation.dobString },
      [new AIMessage(message)],
      nextStepValue,
    );
  }

  // Fallback error
  return buildStateUpdate(
    {},
    [
      new AIMessage(
        "Sorry, I had trouble processing that. Could you try entering your date of birth again?",
      ),
    ],
    step,
    {
      currentGoalOptions: [],
      currentGoalSpecificQuestion: "",
    },
  );
};

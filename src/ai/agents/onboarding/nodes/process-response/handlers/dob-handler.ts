import { AIMessage } from "@langchain/core/messages";
import {
  validateDateOfBirth,
  formatDateToDDMMYYYY,
} from "@/ai/agents/onboarding/utils/dob-validator";
import { HARD_CODED_MESSAGES } from "../../../utils/hardcoded-messages";
import type { QuestionHandler } from "./utils";
import {
  buildStateUpdate,
  getFollowUp,
  getNextStep,
  buildMessage,
} from "./utils";

/**
 * Handle date of birth response: validate format, calculate age, and select appropriate follow-up
 */
export const handleDateOfBirthResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step,
) => {
  console.log("[DOB Handler] Starting with input:", userInput);
  console.log("[DOB Handler] Validation result:", validationResult);

  // Validate date of birth
  const dobValidation = validateDateOfBirth(userInput);
  console.log("[DOB Handler] DOB Validation result:", dobValidation);

  if (
    !dobValidation.isValid ||
    !dobValidation.dateOfBirth ||
    !dobValidation.ageRange
  ) {
    console.log("[DOB Handler] Validation failed:", dobValidation.errorMessage);
    return buildStateUpdate(
      {},
      [
        new AIMessage(
          dobValidation.errorMessage || HARD_CODED_MESSAGES.DOB_INVALID,
        ),
      ],
      step,
    );
  }

  console.log("[DOB Handler] Validation passed");

  // Use the age range from validation result or the one we just calculated
  const ageRange =
    (validationResult.mappedResponse as string | undefined) ||
    dobValidation.ageRange;

  console.log("[DOB Handler] Age range:", ageRange);

  const followUp = getFollowUp(question, ageRange);
  const nextStepValue = getNextStep(followUp, step);
  const message = buildMessage(validationResult, followUp?.text);

  // Store date of birth in DD/MM/YYYY format
  const dobString = formatDateToDDMMYYYY(dobValidation.dateOfBirth);

  console.log("[DOB Handler] Returning with DOB:", dobString);

  return buildStateUpdate(
    { [question.key]: dobString },
    [new AIMessage(message)],
    nextStepValue,
  );
};

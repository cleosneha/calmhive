import { AIMessage } from "@langchain/core/messages";
import { mapAgeToRange } from "@/ai/agents/onboarding/utils/age-mapper";
import { HARD_CODED_MESSAGES } from "../../../utils/hardcoded-messages";
import type { QuestionHandler } from "./utils";
import {
  buildStateUpdate,
  getFollowUp,
  getNextStep,
  buildMessage,
} from "./utils";

/**
 * Extract age as integer from user input
 * Examples: "it is 18" -> 18, "25" -> 25, "I'm 30" -> 30
 */
function extractAgeAsInteger(userInput: string): number | null {
  const ageMatch = userInput.match(/\b(\d{1,3})\b/);
  if (!ageMatch) return null;

  const age = parseInt(ageMatch[1], 10);

  // Validate age is within reasonable range
  if (age < 13 || age > 120) return null;

  return age;
}

/**
 * Handle age response: extract integer, map to range and select appropriate follow-up
 */
export const handleAgeResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  // Extract age as integer from user input
  const ageAsInteger = extractAgeAsInteger(userInput);

  if (ageAsInteger === null) {
    return buildStateUpdate(
      {},
      [new AIMessage(HARD_CODED_MESSAGES.AGE_INVALID)],
      step
    );
  }

  const mappedRange =
    (validationResult.mappedResponse as string | undefined) ||
    mapAgeToRange(String(ageAsInteger));

  // If mapping failed, ask user to re-enter
  if (!mappedRange) {
    return buildStateUpdate(
      {},
      [new AIMessage(HARD_CODED_MESSAGES.AGE_INVALID)],
      step
    );
  }

  const followUp = getFollowUp(question, mappedRange);
  const nextStepValue = getNextStep(followUp, step);
  const message = buildMessage(validationResult, followUp?.text);

  // Store age as string in responses (will be converted to integer when saving to DB)
  return buildStateUpdate(
    { [question.key]: String(ageAsInteger) },
    [new AIMessage(message)],
    nextStepValue
  );
};

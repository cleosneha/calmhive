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
 * Handle age response: map to range and select appropriate follow-up
 */
export const handleAgeResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  const mappedRange =
    (validationResult.mappedResponse as string | undefined) ||
    mapAgeToRange(userInput);

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

  return buildStateUpdate(
    { [question.key]: userInput },
    [new AIMessage(message)],
    nextStepValue
  );
};

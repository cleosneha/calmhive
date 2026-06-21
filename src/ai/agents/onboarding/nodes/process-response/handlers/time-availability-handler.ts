import { AIMessage } from "@langchain/core/messages";
import { validateTimeResponse } from "../../../utils/time-validator";
import { parseAndMapTime } from "../../../utils/time-utils";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { QuestionHandler } from "./utils";
import { buildStateUpdate, buildMessage, getNextStep } from "./utils";

/**
 * Handle time availability response: parse time and get appropriate follow-up
 */
export const handleTimeAvailabilityResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  // console.log( "⏱️ [time-availability-handler] Called with input:", userInput, "| validationResult:", { modificationRequired: validationResult.modificationRequired, modifiedField: validationResult.modifiedField, } );

  const timeValidation = validateTimeResponse(userInput);
  const parsed = parseAndMapTime(userInput);
  const totalMins = parsed.mins ?? 0;

  // console.log( "⏱️ [time-availability-handler] Parsed time:", totalMins, "mins | Range:", parsed.mappedRange || timeValidation.mappedRange );

  // Get the follow-up for this time range
  let timeFollowUp = undefined;

  // Prefer mappedRange key if present
  if (parsed.mappedRange && question.followUps?.[parsed.mappedRange]) {
    timeFollowUp = question.followUps[parsed.mappedRange];
  }

  // If no direct mappedRange match, pick the closest numeric follow-up (e.g., "30 minutes.")
  if (!timeFollowUp && parsed.mins !== null && question.followUps) {
    let bestKey: string | null = null;
    let bestDiff = Infinity;
    for (const k of Object.keys(question.followUps)) {
      if (k === "default") continue;
      const numMatch = k.match(/(-?\d+(?:\.\d+)?)/);
      if (!numMatch) continue;
      const val = parseFloat(numMatch[1]);
      const diff = Math.abs(val - parsed.mins);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestKey = k;
      }
    }

    if (bestKey) {
      timeFollowUp = question.followUps[bestKey];
      // console.log( "⏱️ [time-availability-handler] using closest followUp key:", bestKey, "for mins:", parsed.mins );
    }
  }

  // Fallback to default followUp
  if (!timeFollowUp) {
    timeFollowUp = question.followUps?.default;
  }

  if (!timeFollowUp) return null;

  const nextStepValue = getNextStep(timeFollowUp, step);
  const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];

  // Build message including follow-up and next question (if relevant)
  const message = buildMessage(
    validationResult,
    timeFollowUp.text,
    nextQuestion
  );
  // console.log("⏱️ [time-availability-handler] Returning message:", message);

  return buildStateUpdate(
    {
      timeAvailability: totalMins.toString(),
      timeAvailabilityRange:
        parsed.mappedRange || timeValidation.mappedRange || "custom",
    },
    [new AIMessage(message)],
    nextStepValue
  );
};

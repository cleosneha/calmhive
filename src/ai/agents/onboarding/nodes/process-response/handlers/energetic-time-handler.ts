import { AIMessage } from "@langchain/core/messages";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import type { QuestionHandler } from "./utils";
import { buildStateUpdate, buildMessage, getNextStep } from "./utils";

/**
 * Parse time input and detect which period it belongs to
 * Returns the period and the EXACT user input for storage
 */
function parseEnergeticTime(userInput: string): {
  period: string;
  exactInput: string;
} {
  const lowerInput = userInput.toLowerCase().trim();

  // Match common morning patterns
  if (
    lowerInput.match(
      /\b(morning|early|dawn|sunrise|before\s*noon|before\s*8|before\s*9|before\s*10|8\s*am|9\s*am|10\s*am|6|7|8|9|10)\b/i
    )
  ) {
    return {
      period: "morning",
      exactInput: userInput,
    };
  }

  // Match common afternoon patterns
  if (
    lowerInput.match(
      /\b(afternoon|mid.day|midday|noon|lunch|12|1|2|3|4|5|5pm|4pm|3pm|afternoon|post.lunch)\b/i
    )
  ) {
    return {
      period: "afternoon",
      exactInput: userInput,
    };
  }

  // Match common evening patterns
  if (
    lowerInput.match(
      /\b(evening|night|after\s*work|after\s*school|sunset|dusk|6\s*pm|7\s*pm|8\s*pm|late|6pm|7pm|8pm|9pm|9|10|11|after\s*6)\b/i
    )
  ) {
    return {
      period: "evening",
      exactInput: userInput,
    };
  }

  // If no match, treat as custom with the exact input
  return {
    period: "custom",
    exactInput: userInput,
  };
}

/**
 * Handle energetic time response: parse time input to determine period,
 * store EXACT user input, and select appropriate follow-up based on period
 */
export const handleEnergeticTimeResponse: QuestionHandler = (
  question,
  userInput,
  validationResult,
  _state,
  step
) => {
  const parsed = parseEnergeticTime(userInput);

  // console.log( "⚡ [energetic-time-handler] User input:", userInput, "| Detected period:", parsed.period );

  // Map the detected period to the predefined option for follow-up selection
  const periodToOption: { [key: string]: string } = {
    morning: "Morning (before noon).",
    afternoon: "Afternoon (noon to evening).",
    evening: "Evening (after work/school).",
  };

  const optionForFollowUp = periodToOption[parsed.period];
  let timeFollowUp = null;

  // Get the follow-up text based on the detected period (using predefined option)
  if (optionForFollowUp && question.followUps?.[optionForFollowUp]) {
    timeFollowUp = question.followUps[optionForFollowUp];
    // console.log( "⚡ [energetic-time-handler] Using follow-up for period:", parsed.period, "->", optionForFollowUp );
  } else if (question.followUps?.default) {
    // Fallback to default follow-up for custom periods
    timeFollowUp = question.followUps.default;
  }

  const nextStepValue = timeFollowUp
    ? getNextStep(timeFollowUp, step)
    : step + 1;
  const nextQuestion = ONBOARDING_QUESTIONS[nextStepValue];

  // Build message: use period-based follow-up text, but store EXACT user input
  const message = buildMessage(
    validationResult,
    timeFollowUp?.text,
    nextQuestion
  );

  // console.log("⚡ [energetic-time-handler] Returning message:", message);

  return buildStateUpdate(
    {
      energeticTime: userInput, // Store EXACT user input: "before 8 AM"
      energeticTimePeriod: parsed.period, // Store detected period: "morning"
    },
    [new AIMessage(message)],
    nextStepValue
  );
};

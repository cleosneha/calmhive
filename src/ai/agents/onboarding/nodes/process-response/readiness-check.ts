import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { validateUserResponse } from "../../tools/validation";
import { HARD_CODED_MESSAGES } from "../../utils/hardcoded-messages";

/**
 * Handle readiness check using unified validation (including LLM)
 */
export async function handleReadinessCheck(
  state: OnboardingStateType,
  userInput: string
): Promise<Partial<OnboardingStateType> | null> {
  if (state.step !== 0) return null;

  try {
    // Otherwise, fallback to LLM validation
    const validationResult = await validateUserResponse(
      userInput,
      ONBOARDING_QUESTIONS[0].text,
      ONBOARDING_QUESTIONS[1]?.text || ""
    );

    // PRIORITY 1: Check for safety issues FIRST
    if (validationResult.hasSafetyIssue) {
      return {
        messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY_LONG)],
        step: 0,
        waitingForSafetyAck: true,
      };
    }

    // PRIORITY 2: Check readiness
    if (validationResult.readiness === "yes") {
      return { step: 1 };
    }

    if (validationResult.readiness === "no") {
      return {
        step: 0,
        messages: [new AIMessage(HARD_CODED_MESSAGES.READINESS_NOT_READY)],
      };
    }

    // PRIORITY 3: Check relevance
    if (!validationResult.isRelevant) {
      return {
        messages: [
          new AIMessage(
            validationResult.errorMessage ||
              "Could you clarify a bit so I can help best?"
          ),
        ],
        step: 0,
      };
    }

    // No decision from LLM — do nothing here
    return null;
  } catch (err) {
    console.error("Error checking readiness via LLM:", err);
    return null;
  }
}

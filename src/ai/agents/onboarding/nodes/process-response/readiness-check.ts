import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";
import { validateUserResponse } from "../../tools/validation";

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
      const safetyMsg =
        "I appreciate you sharing that, but I want to make sure we're aligned. 🤍\n\n" +
        "It sounds like you might be going through something really difficult right now. Your safety and well-being are incredibly important to us.\n\n" +
        "There are people who genuinely care and want to help. You don't have to go through this alone. Please take that first step and reach out to someone today. 🤍" +
        "CalmHive is designed to support well-being and healthy habits. " +
        "Could you please share a goal that aligns with what CalmHive can support you with?";

      return {
        messages: [new AIMessage(safetyMsg)],
        step: 0,
      };
    }

    if (validationResult.readiness === "yes") {
      return { step: 1 };
    }

    if (validationResult.readiness === "no") {
      const msg =
        validationResult.followUpText ||
        ONBOARDING_QUESTIONS[0].followUps?.["No, not ready yet"]?.text ||
        "No pressure at all — take your time. Tell me 'ready to start' whenever you're good to go. 🤍";

      return { step: 0, messages: [new AIMessage(msg)] };
    }

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

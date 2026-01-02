import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../state";
import { ONBOARDING_QUESTIONS } from "@/ai/agents/onboarding/questions";

/**
 * Node: Mark Onboarding as Complete
 * Intermediate node to mark onboarding as complete after acknowledgment
 */
export async function markCompleteNode(_state: OnboardingStateType) {
  return {
    isComplete: true,
    step: ONBOARDING_QUESTIONS.length + 1,
  };
}

/**
 * Node: Complete Onboarding
 * Final message before redirecting to T&C
 */
export async function completeNode(_state: OnboardingStateType) {
  const message = `Thank you so much for sharing! That's all I need to create your personalized plan. 🤍

🎉 **Your responses have been saved!**

One last step: Please review and accept our Terms & Conditions to continue.

Click "Proceed to Terms & Conditions" below to continue.`;

  return {
    messages: [new AIMessage(message)],
  };
}

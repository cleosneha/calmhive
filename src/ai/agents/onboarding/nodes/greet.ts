import { AIMessage } from "@langchain/core/messages";
import type { OnboardingStateType } from "../state";
import { ONBOARDING_QUESTIONS } from "../questions";

// Greet node: Send initial greeting message
export async function greetNode(state: OnboardingStateType) {
  // Only greet if no messages exist yet
  if (state.messages && state.messages.length > 0) {
    return {};
  }

  // Extract first name from full name
  const firstName = state.userName.split(" ")[0];

  const greeting = ONBOARDING_QUESTIONS[0].text.replace(
    "{firstName}",
    firstName
  );

  return {
    messages: [new AIMessage(greeting)],
    step: 0,
  };
}

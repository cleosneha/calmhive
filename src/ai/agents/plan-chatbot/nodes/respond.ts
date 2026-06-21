import type { PlanChatbotStateType } from "../state";
import { AIMessage } from "@langchain/core/messages";

/**
 * Respond Node: Answer user's query about their plan
 * Uses cached answer from analyze node to avoid duplicate LLM call
 * Skips if response was already handled in analyze node (safety/irrelevant)
 */
export async function respondNode(
  state: PlanChatbotStateType,
): Promise<Partial<PlanChatbotStateType>> {
  // console.log("  📤 [respondNode] START");
  // console.log( "    responseHandled:", state.responseHandled, "| cachedAnswer:", state.cachedAnswer ? "Yes" : "No");

  // Skip if response was already handled (safety/irrelevant detected in analyze)
  if (state.responseHandled) {
    // console.log("    ⏭️ Response already handled - skipping");
    return {};
  }

  // Use cached answer from analyze node
  if (state.cachedAnswer) {
    // console.log("    💬 Returning cached answer");
    return {
      messages: [new AIMessage(state.cachedAnswer)],
      cachedAnswer: undefined, // Clear cache
    };
  }

  // Should not reach here in normal flow
  // console.log("    ⚠️ No cached answer - this should not happen");
  return {};
}

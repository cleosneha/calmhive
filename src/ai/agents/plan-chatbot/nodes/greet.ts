import type { PlanChatbotStateType } from "../state";
import { AIMessage } from "@langchain/core/messages";

/**
 * Greet Node: Send initial greeting message
 */
export async function greetNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  // Only greet if no messages exist yet
  if (state.messages && state.messages.length > 0) {
    return {};
  }

  const greeting = `Hi${
    state.userName ? ` ${state.userName}` : ""
  }! I'm your Plan Assistant. I can help you:

- **Answer questions** about your current plan, tasks, or schedule
- **Edit your plan** by adding, removing, or modifying tasks

What would you like to know?`;

  return {
    messages: [new AIMessage(greeting)],
  };
}

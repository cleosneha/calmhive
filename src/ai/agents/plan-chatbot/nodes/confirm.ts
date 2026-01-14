import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

/**
 * Confirm Node: Handle user's confirmation response
 */
export async function confirmNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage
      ? lastMessage.content.toString().toLowerCase().trim()
      : "";

  // Check if user confirmed
  const isConfirmed =
    userMessage === "yes" ||
    userMessage === "confirm" ||
    userMessage === "ok" ||
    userMessage === "sure" ||
    userMessage === "proceed";

  const isRejected =
    userMessage === "no" ||
    userMessage === "cancel" ||
    userMessage === "nope" ||
    userMessage === "don't";

  if (isConfirmed && state.pendingEdit) {
    // User confirmed, proceed to execute edit
    return {
      mode: "edit",
      waitingForConfirmation: false,
    };
  }

  if (isRejected) {
    // User rejected, clear pending edit
    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      messages: [
        new AIMessage(
          "No problem! Your plan remains unchanged. Is there anything else I can help you with?"
        ),
      ],
    };
  }

  // User didn't give clear confirmation/rejection
  return {
    messages: [
      new AIMessage(
        'Please confirm by typing **"yes"** to proceed or **"no"** to cancel.'
      ),
    ],
  };
}

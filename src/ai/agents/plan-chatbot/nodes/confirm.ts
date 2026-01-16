import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { HARD_CODED_MESSAGES } from "../utils";

/**
 * Confirm Node: Handle user's confirmation response
 */
export async function confirmNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    console.log("[confirmNode] No human message found");
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage
      ? lastMessage.content.toString().toLowerCase().trim()
      : "";

  console.log("[confirmNode] User message:", userMessage);
  console.log(
    "[confirmNode] Waiting for confirmation:",
    state.waitingForConfirmation
  );
  console.log("[confirmNode] Has pending edit:", !!state.pendingEdit);

  // Check for button actions (prefixed with ACTION:)
  if (userMessage.startsWith("action:confirm") || userMessage === "[confirm]") {
    console.log("[confirmNode] CONFIRM action detected");
    // User confirmed via button
    if (state.pendingEdit) {
      console.log("[confirmNode] Proceeding with edit execution");
      return {
        mode: "edit",
        waitingForConfirmation: false,
      };
    } else {
      console.log("[confirmNode] WARNING: No pending edit to confirm!");
    }
  }

  if (userMessage.startsWith("action:cancel") || userMessage === "[cancel]") {
    console.log("[confirmNode] CANCEL action detected");
    // User cancelled via button
    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      messages: [new AIMessage(HARD_CODED_MESSAGES.CONFIRMATION_CANCEL)],
    };
  }

  // Legacy text-based confirmation for backwards compatibility
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
      messages: [new AIMessage(HARD_CODED_MESSAGES.CONFIRMATION_CANCEL)],
    };
  }

  // User didn't give clear confirmation/rejection
  return {
    messages: [
      new AIMessage(
        'Please use the **Apply Changes** or **Cancel** buttons, or type **"yes"** to proceed or **"no"** to cancel.'
      ),
    ],
  };
}

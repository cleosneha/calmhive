import type { PlanChatbotStateType } from "../state";
import { AIMessage } from "@langchain/core/messages";
import { executePlanEdit, HARD_CODED_MESSAGES } from "../utils";

/**
 * Execute Edit Node: Apply the confirmed edit to the database
 */
export async function executeEditNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  if (!state.pendingEdit) {
    return {
      messages: [
        new AIMessage(
          "No edit to execute. Something went wrong. Please try again."
        ),
      ],
    };
  }

  try {
    // Execute the edit (DB + vector store update)
    const result = await executePlanEdit(
      state.userId,
      state.pendingEdit.type,
      state.pendingEdit.data,
      state.planId
    );

    if (!result.success) {
      return {
        mode: "query",
        waitingForConfirmation: false,
        pendingEdit: null,
        messages: [new AIMessage(HARD_CODED_MESSAGES.EXECUTE_ERROR)],
      };
    }

    // Store last edit for undo (with previous data)
    const lastEdit = {
      type: state.pendingEdit.type,
      data: state.pendingEdit.data,
      previousData: result.previousData || {},
      description: state.pendingEdit.description,
      timestamp: Date.now(),
    };

    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      lastEdit,
      messages: [
        new AIMessage({
          content: `✅ **Plan updated successfully!**\n\n${
            result.message || "Your changes have been applied."
          }\n\n[UNDO_BUTTON]`,
        }),
      ],
    };
  } catch (error) {
    console.error("Error executing plan edit:", error);
    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      messages: [new AIMessage(HARD_CODED_MESSAGES.EXECUTE_ERROR)],
    };
  }
}

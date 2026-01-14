import type { PlanChatbotStateType } from "../state";
import { AIMessage } from "@langchain/core/messages";
import { executePlanEdit } from "../utils";

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
      state.pendingEdit.data
    );

    if (!result.success) {
      return {
        mode: "query",
        waitingForConfirmation: false,
        pendingEdit: null,
        messages: [
          new AIMessage(
            `Failed to update your plan: ${
              result.error || "Unknown error"
            }. Please try again.`
          ),
        ],
      };
    }

    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      messages: [
        new AIMessage(
          `✅ **Plan updated successfully!**\n\n${
            result.message || "Your changes have been applied."
          }`
        ),
      ],
    };
  } catch (error) {
    console.error("Error executing plan edit:", error);
    return {
      mode: "query",
      waitingForConfirmation: false,
      pendingEdit: null,
      messages: [
        new AIMessage(
          "An error occurred while updating your plan. Please try again later."
        ),
      ],
    };
  }
}

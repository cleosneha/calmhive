import type { PlanChatbotStateType } from "../state";
import { AIMessage } from "@langchain/core/messages";
import { executePlanEdit, HARD_CODED_MESSAGES } from "../utils";

/**
 * Undo Node: Revert the last executed edit
 */
export async function undoNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  if (!state.lastEdit) {
    return {
      isUndoRequest: false,
      messages: [new AIMessage(HARD_CODED_MESSAGES.UNDO_NOTHING)],
    };
  }

  // Check if undo is still within time limit (e.g., 5 minutes)
  const UNDO_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes in ms
  const timeSinceEdit = Date.now() - state.lastEdit.timestamp;

  if (timeSinceEdit > UNDO_TIME_LIMIT) {
    return {
      isUndoRequest: false,
      lastEdit: null,
      messages: [new AIMessage(HARD_CODED_MESSAGES.UNDO_EXPIRED)],
    };
  }

  try {
    const { type, previousData } = state.lastEdit;

    // Reverse the edit based on type
    switch (type) {
      case "add_task": {
        // Remove the added task
        const result = await executePlanEdit(
          state.userId,
          "remove_task",
          {
            taskId: previousData?.taskId,
          },
          state.planId
        );

        if (!result.success) {
          return {
            isUndoRequest: false,
            messages: [
              new AIMessage(
                `Failed to undo: ${result.error || "Unknown error"}`
              ),
            ],
          };
        }
        break;
      }

      case "remove_task": {
        // Re-add the removed task
        if (previousData) {
          const result = await executePlanEdit(
            state.userId,
            "add_task",
            previousData,
            state.planId
          );

          if (!result.success) {
            return {
              isUndoRequest: false,
              messages: [
                new AIMessage(
                  `Failed to undo: ${result.error || "Unknown error"}`
                ),
              ],
            };
          }
        }
        break;
      }

      case "modify_task": {
        // Restore previous task data
        if (previousData) {
          const result = await executePlanEdit(
            state.userId,
            "modify_task",
            previousData,
            state.planId
          );

          if (!result.success) {
            return {
              isUndoRequest: false,
              messages: [
                new AIMessage(
                  `Failed to undo: ${result.error || "Unknown error"}`
                ),
              ],
            };
          }
        }
        break;
      }

      case "change_days_off": {
        // Restore previous days off
        if (previousData?.daysOff) {
          const result = await executePlanEdit(
            state.userId,
            "change_days_off",
            previousData,
            state.planId
          );

          if (!result.success) {
            return {
              isUndoRequest: false,
              messages: [
                new AIMessage(
                  `Failed to undo: ${result.error || "Unknown error"}`
                ),
              ],
            };
          }
        }
        break;
      }

      default:
        return {
          isUndoRequest: false,
          messages: [new AIMessage("Cannot undo this type of change.")],
        };
    }

    return {
      mode: "query",
      isUndoRequest: false,
      lastEdit: null,
      messages: [
        new AIMessage(
          `✅ **Changes reverted successfully!**\n\nYour plan has been restored to its previous state.`
        ),
      ],
    };
  } catch (error) {
    console.error("Error during undo:", error);
    return {
      isUndoRequest: false,
      messages: [
        new AIMessage(
          "An error occurred while undoing the changes. Please try again."
        ),
      ],
    };
  }
}

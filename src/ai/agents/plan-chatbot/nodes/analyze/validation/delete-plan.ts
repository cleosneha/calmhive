import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";

export async function validateDeletePlan(
  _state: PlanChatbotStateType,
  _analysis: EditAnalysisResult,
): Promise<{
  isValid: boolean;
  needsClarification: boolean;
  response: Partial<PlanChatbotStateType>;
}> {
  console.log("  🗑️ DELETE PLAN REQUEST");

  return {
    isValid: true,
    needsClarification: false,
    response: {
      waitingForConfirmation: true,
      pendingEdit: {
        type: "delete_plan",
        data: {},
        description: "Delete entire plan",
        preview: {
          changes: [
            {
              field: "Plan",
              oldValue: "All tasks and plan data",
              newValue: "Deleted",
            },
          ],
        },
      },
      messages: [
        new AIMessage(
          "⚠️ **Confirmation Required**\n\n" +
            "You want to **delete your entire plan**. This will:\n" +
            "• Remove all tasks from all days\n" +
            "• Delete all plan data\n" +
            "• Clear your wellness plan history\n\n" +
            "**⚠️ WARNING: This action is IRREVERSIBLE. All your plan data will be permanently lost.**\n\n" +
            "Are you absolutely sure you want to proceed?\n\n[CONFIRM_BUTTON][CANCEL_BUTTON]",
        ),
      ],
      awaitingClarification: null,
    },
  };
}

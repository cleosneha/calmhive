import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";
import { processDayOperation } from "../../../helpers";

export async function validateDayOperation(
  state: PlanChatbotStateType,
  analysis: EditAnalysisResult,
): Promise<{
  isValid: boolean;
  needsClarification: boolean;
  response: Partial<PlanChatbotStateType>;
}> {
  // console.log(`  📅 DAY OPERATION: ${analysis.editType}`);
  const result = await processDayOperation(state.userId, analysis);

  if (!result.shouldConfirm) {
    // console.log("  ⚠️ Day operation needs handling");

    // Type assertion for the false branch
    const errorResult = result as {
      shouldConfirm: false;
      errorMessage: string;
      needsClarification?: boolean;
      clarificationOperation?: string;
      clarificationContext?: Record<string, unknown>;
    };

    // Check if we need clarification
    if (errorResult.needsClarification) {
      // console.log("  🔄 Setting awaiting clarification state");
      return {
        isValid: false,
        needsClarification: true,
        response: {
          messages: [new AIMessage(errorResult.errorMessage)],
          responseHandled: true,
          awaitingClarification: {
            operation: errorResult.clarificationOperation as
              | "swap_days"
              | "remove_days"
              | "copy_day"
              | "rename_day",
            context: errorResult.clarificationContext,
          },
        },
      };
    }

    // Regular error
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [new AIMessage(errorResult.errorMessage)],
        responseHandled: true,
        awaitingClarification: null,
      },
    };
  }

  // console.log("  ✅ Day operation validated, showing confirmation");
  return {
    isValid: true,
    needsClarification: false,
    response: {
      waitingForConfirmation: true,
      pendingEdit: result.pendingEdit,
      messages: [new AIMessage(result.confirmMessage)],
      awaitingClarification: null,
    },
  };
}

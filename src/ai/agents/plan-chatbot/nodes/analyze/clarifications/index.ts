import type { PlanChatbotStateType } from "../../../state";
import { AIMessage } from "@langchain/core/messages";
import { handleAddTaskClarification } from "./add-task-clarification";
import { handleDayOperationsClarification } from "./day-operations-clarification";

export { handleAddTaskClarification } from "./add-task-clarification";
export { handleDayOperationsClarification } from "./day-operations-clarification";

export async function handleClarificationResponse(
  state: PlanChatbotStateType,
  userMessage: string,
): Promise<Partial<PlanChatbotStateType>> {
  console.log(
    "  🔄 Handling clarification response for:",
    state.awaitingClarification,
  );

  if (!state.awaitingClarification) {
    return {
      messages: [
        new AIMessage("No clarification was expected. Please try again."),
      ],
      awaitingClarification: null,
    };
  }

  // Route to appropriate clarification handler
  switch (state.awaitingClarification.operation) {
    case "add_task":
      return await handleAddTaskClarification(state, userMessage);

    case "remove_days":
    case "add_days_off":
    case "copy_day":
    case "rename_day":
    case "swap_days":
      return await handleDayOperationsClarification(state, userMessage);

    default:
      return {
        messages: [
          new AIMessage(
            "I don't know how to handle this clarification. Please start over.",
          ),
        ],
        awaitingClarification: null,
      };
  }
}

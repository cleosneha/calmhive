import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { analyzeUserMessage, buildEditConfirmation } from "../utils";

/**
 * Analyze Node: Analyze user's message to determine intent
 */
export async function analyzeNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage ? lastMessage.content.toString() : "";

  // Analyze the message using LLM
  const analysis = await analyzeUserMessage(userMessage);

  // If not relevant or has safety issues
  if (!analysis.isRelevant) {
    return {
      messages: [
        new AIMessage(
          "I can only help with questions or edits related to your wellness plan. Please ask about your schedule, tasks, or request plan changes."
        ),
      ],
    };
  }

  if (!analysis.isSafe) {
    return {
      messages: [
        new AIMessage(
          analysis.safetyIssue ||
            "This request contains concerning content. I can only help with wellness-related plan adjustments. Please rephrase your request."
        ),
      ],
    };
  }

  // If it's an edit request, prepare for confirmation
  if (analysis.isEditRequest && analysis.extractedEdit) {
    const confirmation = buildEditConfirmation(analysis);

    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: analysis.editType || "other",
        data: analysis.extractedEdit,
        description: confirmation,
      },
      messages: [
        new AIMessage(
          `${confirmation}\n\nPlease confirm by typing **"yes"** or cancel by typing **"no"**.`
        ),
      ],
    };
  }

  // If it's a query, let the respond node handle it
  return {
    mode: "query",
  };
}

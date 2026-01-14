import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { answerPlanQuery } from "../utils";

/**
 * Respond Node: Answer user's query about their plan
 */
export async function respondNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage ? lastMessage.content.toString() : "";

  try {
    // Generate answer using RAG (retrieval from vector store + LLM)
    const answer = await answerPlanQuery(userMessage, state.userId);

    return {
      messages: [new AIMessage(answer)],
    };
  } catch (error) {
    console.error("Error answering plan query:", error);
    return {
      messages: [
        new AIMessage(
          "I encountered an error while processing your question. Please try again."
        ),
      ],
    };
  }
}

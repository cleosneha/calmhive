"use server";

import { HumanMessage } from "@langchain/core/messages";
import { compilePlanChatbotGraph } from "@/ai/agents/plan-chatbot";
import { getCurrentUser } from "@/actions/auth";
import type { PlanChatMessage } from "@/ai/agents/plan-chatbot/types";

export interface PlanChatResponse {
  success: boolean;
  messages?: PlanChatMessage[];
  error?: string;
}

/**
 * Process plan chatbot message with LangGraph
 */
export async function processPlanChatMessage(
  userMessage: string,
  threadId: string
): Promise<PlanChatResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Compile graph
    const graph = compilePlanChatbotGraph();

    // Get current state or initialize
    const config = {
      configurable: { thread_id: threadId },
    };

    const currentState = await graph.getState(config);

    // Initialize state if first message
    const initialState = currentState.values.userId
      ? {}
      : {
          userId: user.id,
          userName: user.name || "there",
        };

    // Invoke graph with user message
    const result = await graph.invoke(
      {
        ...initialState,
        messages: [new HumanMessage(userMessage)],
      },
      config
    );

    // Extract messages
    const messages: PlanChatMessage[] = result.messages.map((msg) => ({
      role: msg._getType() === "human" ? "user" : "assistant",
      content: msg.content.toString(),
    }));

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error processing plan chat message:", error);
    return {
      success: false,
      error: "Failed to process message. Please try again.",
    };
  }
}

/**
 * Initialize plan chatbot session
 */
export async function initializePlanChatSession(
  threadId: string
): Promise<PlanChatResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Compile graph
    const graph = compilePlanChatbotGraph();

    // Initialize with greeting
    const config = {
      configurable: { thread_id: threadId },
    };

    const result = await graph.invoke(
      {
        userId: user.id,
        userName: user.name || "there",
        messages: [],
      },
      config
    );

    // Extract messages
    const messages: PlanChatMessage[] = result.messages.map((msg) => ({
      role: msg._getType() === "human" ? "user" : "assistant",
      content: msg.content.toString(),
    }));

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error initializing plan chat session:", error);
    return {
      success: false,
      error: "Failed to initialize chat. Please try again.",
    };
  }
}

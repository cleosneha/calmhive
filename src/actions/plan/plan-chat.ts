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

    // Extract messages and parse action buttons
    const messages: PlanChatMessage[] = result.messages.map((msg) => {
      const content = msg.content.toString();
      const actions = parseActionButtons(content);

      return {
        role: msg._getType() === "human" ? "user" : "assistant",
        content: content
          .replace(/\[CONFIRM_BUTTON\]/g, "")
          .replace(/\[CANCEL_BUTTON\]/g, "")
          .replace(/\[UNDO_BUTTON\]/g, "")
          .trim(),
        actions,
      };
    });

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
 * Parse action buttons from message content
 */
function parseActionButtons(
  content: string
): Array<{ type: "confirm" | "cancel" | "undo"; label: string }> | undefined {
  const actions: Array<{ type: "confirm" | "cancel" | "undo"; label: string }> =
    [];

  if (content.includes("[CONFIRM_BUTTON]")) {
    actions.push({ type: "confirm", label: "Apply Changes" });
  }

  if (content.includes("[CANCEL_BUTTON]")) {
    actions.push({ type: "cancel", label: "Cancel" });
  }

  if (content.includes("[UNDO_BUTTON]")) {
    actions.push({ type: "undo", label: "Undo" });
  }

  return actions.length > 0 ? actions : undefined;
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

    // Extract messages and parse action buttons
    const messages: PlanChatMessage[] = result.messages.map((msg) => {
      const content = msg.content.toString();
      const actions = parseActionButtons(content);

      return {
        role: msg._getType() === "human" ? "user" : "assistant",
        content: content
          .replace(/\[CONFIRM_BUTTON\]/g, "")
          .replace(/\[CANCEL_BUTTON\]/g, "")
          .replace(/\[UNDO_BUTTON\]/g, "")
          .trim(),
        actions,
      };
    });

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

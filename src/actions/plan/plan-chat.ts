"use server";

import { HumanMessage } from "@langchain/core/messages";
import { compilePlanChatbotGraph } from "@/ai/agents/plan-chatbot";
import { getCurrentUser } from "@/actions/auth";
import type { PlanChatMessage } from "@/ai/agents/plan-chatbot/types";

export interface PlanChatResponse {
  success: boolean;
  messages?: PlanChatMessage[];
  error?: string;
  threadId?: string;
}

/**
 * Process plan chatbot message with LangGraph
 */
export async function processPlanChatMessage(
  userMessage: string,
  threadId: string, // Use the session-specific thread ID from initialization
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

    // Use the provided thread ID (which includes timestamp for session isolation)
    // Validate it belongs to this user for security
    if (!threadId.startsWith(`plan-chat-${user.id}`)) {
      console.error(
        "[processPlanChatMessage] Thread ID mismatch - possible security issue",
      );
      return {
        success: false,
        error: "Invalid session",
      };
    }

    console.log("[processPlanChatMessage] Using thread ID:", threadId);

    // Compile graph
    const graph = compilePlanChatbotGraph();

    // Get current state or initialize
    const config = {
      configurable: { thread_id: threadId },
    };

    const currentState = await graph.getState(config);

    console.log("[processPlanChatMessage] Current state loaded:");
    console.log("  - userId:", currentState.values.userId);
    console.log(
      "  - waitingForConfirmation:",
      currentState.values.waitingForConfirmation,
    );
    console.log(
      "  - pendingEdit:",
      currentState.values.pendingEdit ? "EXISTS" : "NULL",
    );
    console.log("  - mode:", currentState.values.mode);
    console.log(
      "  - messages count:",
      currentState.values.messages?.length || 0,
    );

    // Only initialize userId/userName on first message
    // For subsequent messages, the checkpointer will load previous state automatically
    const shouldInitialize = !currentState.values.userId;

    console.log(
      "[processPlanChatMessage] Should initialize:",
      shouldInitialize,
    );

    // Track initial message count to return only new messages
    const initialMessageCount = currentState.values.messages?.length || 0;

    // Invoke graph with user message
    // If first time, provide userId/userName. Otherwise, just the message.
    const result = await graph.invoke(
      shouldInitialize
        ? {
            userId: user.id,
            userName: user.name || "there",
            messages: [new HumanMessage(userMessage)],
          }
        : {
            messages: [new HumanMessage(userMessage)],
          },
      config,
    );

    // Extract only NEW messages (those added during this invocation)
    // This prevents duplicate/repetitive messages from being returned
    const newMessages = (result.messages || []).slice(initialMessageCount);

    const messages: PlanChatMessage[] = newMessages.map((msg) => {
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
      threadId: threadId,
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
  content: string,
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
 * Initialize plan chatbot session - starts fresh with unique session ID
 */
export async function initializePlanChatSession(): Promise<PlanChatResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create unique thread ID for each session to ensure fresh start on page refresh
    // Format: plan-chat-{userId}-{timestamp}
    const timestamp = Date.now();
    const userSpecificThreadId = `plan-chat-${user.id}-${timestamp}`;

    console.log(
      "[initializePlanChatSession] Starting fresh session:",
      userSpecificThreadId,
    );

    // Compile graph
    const graph = compilePlanChatbotGraph();

    // Initialize with greeting using unique thread ID
    const config = {
      configurable: { thread_id: userSpecificThreadId },
    };

    const result = await graph.invoke(
      {
        userId: user.id,
        userName: user.name || "there",
        messages: [],
      },
      config,
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
      threadId: userSpecificThreadId,
    };
  } catch (error) {
    console.error("Error initializing plan chat session:", error);
    return {
      success: false,
      error: "Failed to initialize chat. Please try again.",
    };
  }
}

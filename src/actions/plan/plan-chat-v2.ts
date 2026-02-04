"use server";

import { getCurrentUser } from "@/actions/auth";
import {
  processMessage,
  handleConfirmation as handleConfirmationAgent,
  getGreetingMessage,
} from "@/ai/agents/plan-chatbot-2/agent";
import type {
  PlanChatMessage,
  PlanChatbotState,
} from "@/ai/agents/plan-chatbot-2/types";

export interface PlanChatResponseV2 {
  success: boolean;
  messages?: PlanChatMessage[];
  error?: string;
  threadId?: string;
  state?: PlanChatbotState;
}

/**
 * Process plan chatbot message with plan-chatbot-2 agent
 */
export async function processPlanChatMessageV2(
  userMessage: string,
  _threadId: string, // Deprecated: kept for backward compatibility, ignored in favor of user-specific thread ID
  currentState?: Partial<PlanChatbotState>,
): Promise<PlanChatResponseV2> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create user-specific thread ID to prevent cross-user collisions
    // Format: plan-chat-v2-{userId}
    const userSpecificThreadId = `plan-chat-v2-${user.id}`;

    console.log("[processPlanChatMessageV2] Processing message");
    console.log("  - userId:", user.id);
    console.log("  - threadId:", userSpecificThreadId);
    console.log("  - message:", userMessage);
    console.log(
      "  - waitingForConfirmation:",
      currentState?.waitingForConfirmation,
    );
    console.log(
      "  - pendingEdit:",
      currentState?.pendingEdit ? "EXISTS" : "NULL",
    );

    // Check if this is a confirmation action
    if (
      userMessage.startsWith("action:") &&
      currentState?.waitingForConfirmation
    ) {
      // Extract action type
      const action = userMessage.replace("action:", "") as "confirm" | "cancel";

      // Handle confirmation
      const result = await handleConfirmationAgent(
        user.id,
        action,
        userSpecificThreadId,
        currentState as PlanChatbotState,
      );

      return {
        success: true,
        messages: [result.response],
        threadId: userSpecificThreadId,
        state: result.state,
      };
    }

    // Process regular message
    const result = await processMessage(
      user.id,
      userMessage,
      userSpecificThreadId,
      currentState,
    );

    return {
      success: true,
      messages: [result.response],
      threadId: userSpecificThreadId,
      state: result.state,
    };
  } catch (error) {
    console.error("Error processing plan chat message (v2):", error);
    return {
      success: false,
      error: "Failed to process message. Please try again.",
    };
  }
}

/**
 * Initialize plan chatbot session (v2)
 */
export async function initializePlanChatSessionV2(): Promise<PlanChatResponseV2> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create user-specific thread ID to prevent cross-user collisions
    // Format: plan-chat-v2-{userId}
    const userSpecificThreadId = `plan-chat-v2-${user.id}`;

    console.log("[initializePlanChatSessionV2] Initializing session");
    console.log("  - userId:", user.id);
    console.log("  - threadId:", userSpecificThreadId);

    // Get greeting message
    const greetingMessage = getGreetingMessage(user.name || undefined);

    return {
      success: true,
      messages: [greetingMessage],
      threadId: userSpecificThreadId,
      state: {
        messages: [],
        userId: user.id,
        waitingForConfirmation: false,
        pendingEdit: null,
      },
    };
  } catch (error) {
    console.error("Error initializing plan chat session (v2):", error);
    return {
      success: false,
      error: "Failed to initialize chat. Please try again.",
    };
  }
}

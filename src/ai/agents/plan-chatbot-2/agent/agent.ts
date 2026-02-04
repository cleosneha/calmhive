import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

import { SYSTEM_PROMPT } from "../prompts/system-prompt";
import { geminiModel } from "../utils/llm-service";
import {
  getPlanContextTool,
  confirmEditTool,
  cancelEditTool,
  addTaskTool,
  removeTaskTool,
  modifyTaskTool,
  removeDaysTool,
  addDaysOffTool,
  swapDaysTool,
  copyDayTool,
  renameDayTool,
  deletePlanTool,
} from "../tools";
import { executeEdit } from "../execute";
import { MESSAGES } from "../utils/hardcoded-messages";
import type { PlanChatMessage, PendingEdit, PlanChatbotState } from "../types";

/**
 * Serialize LangChain messages to plain objects for Client Components
 */
function serializeMessages(messages: unknown[]): Record<string, unknown>[] {
  return messages.map((msg) => {
    if (msg instanceof HumanMessage || msg instanceof AIMessage) {
      return {
        type: msg instanceof HumanMessage ? "human" : "ai",
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      };
    }
    // Already a plain object
    return msg as Record<string, unknown>;
  });
}

/**
 * State schema for the plan chatbot agent
 */
const PlanChatbotStateSchema = z.object({
  messages: z.array(z.unknown()),
  userId: z.string(),
  waitingForConfirmation: z.boolean().default(false),
  pendingEdit: z.unknown().nullable().default(null),
  summary: z.string().optional(),
});

/**
 * Memory saver for checkpointing agent state
 */
const memorySaver = new MemorySaver();

/**
 * All tools available to the agent
 */
const allTools = [
  getPlanContextTool,
  addTaskTool,
  removeTaskTool,
  modifyTaskTool,
  removeDaysTool,
  addDaysOffTool,
  swapDaysTool,
  copyDayTool,
  renameDayTool,
  deletePlanTool,
  confirmEditTool,
  cancelEditTool,
];

/**
 * Create the plan chatbot agent with:
 * - Gemini as primary model (with built-in fallback retry mechanism)
 * - Memory checkpointing for conversation state
 * - All tools available for plan operations
 */
export function createPlanChatbotAgent() {
  // Use createAgent with static model import and tools
  // The LangChain framework handles fallback internally
  const agent = createAgent({
    model: geminiModel,
    tools: allTools,
    systemPrompt: SYSTEM_PROMPT,
    stateSchema: PlanChatbotStateSchema,
    checkpointer: memorySaver,
  });

  return agent;
}

/**
 * Process a user message and return the assistant's response
 * @param userId - The user's ID
 * @param userMessage - The user's message
 * @param threadId - The conversation thread ID (for memory persistence)
 * @param currentState - Optional current state (for pending edits)
 */
export async function processMessage(
  userId: string,
  userMessage: string,
  threadId: string,
  currentState?: Partial<PlanChatbotState>,
): Promise<{
  response: PlanChatMessage;
  state: PlanChatbotState;
}> {
  try {
    console.log(`🤖 [plan-chatbot-2] Processing message for user: ${userId}`);
    console.log(`📝 [plan-chatbot-2] User message: ${userMessage}`);

    // Create or get the agent
    const agent = createPlanChatbotAgent();

    // Build the input state
    const inputState = {
      messages: [new HumanMessage(userMessage)],
      userId,
      waitingForConfirmation: currentState?.waitingForConfirmation ?? false,
      pendingEdit: currentState?.pendingEdit ?? null,
      summary: currentState?.summary ?? "",
    };

    // Invoke the agent
    const result = await agent.invoke(inputState, {
      configurable: { thread_id: threadId },
      context: { userId },
    });

    // Extract the last AI message
    const messages = result.messages as unknown[];
    const lastMessage = messages[messages.length - 1];
    let responseContent = "";

    if (lastMessage instanceof AIMessage) {
      responseContent = lastMessage.content.toString();
    } else if (
      typeof lastMessage === "object" &&
      lastMessage !== null &&
      "content" in lastMessage
    ) {
      responseContent = String((lastMessage as { content: unknown }).content);
    }

    // Check if we need to show confirmation buttons
    const actions = result.waitingForConfirmation
      ? [
          { type: "confirm" as const, label: "Apply Changes" },
          { type: "cancel" as const, label: "Cancel" },
        ]
      : undefined;

    // Build the response
    const response: PlanChatMessage = {
      role: "assistant",
      content: responseContent,
      actions,
    };

    // Build the updated state with serialized messages
    const serializedMessages = serializeMessages(result.messages as unknown[]);
    const updatedState: PlanChatbotState = {
      messages: serializedMessages,
      userId,
      waitingForConfirmation: Boolean(result.waitingForConfirmation),
      pendingEdit: (result.pendingEdit as PendingEdit) ?? null,
      summary: result.summary as string | undefined,
    };

    console.log(`✅ [plan-chatbot-2] Response generated successfully`);
    return { response, state: updatedState };
  } catch (error) {
    console.error("❌ [plan-chatbot-2] Error processing message:", error);

    // Return a fallback error message
    return {
      response: {
        role: "assistant",
        content: MESSAGES.ERROR,
      },
      state: {
        messages: [],
        userId,
        waitingForConfirmation: false,
        pendingEdit: null,
      },
    };
  }
}

/**
 * Handle confirmation action from the user
 * @param userId - The user's ID
 * @param action - "confirm" or "cancel"
 * @param threadId - The conversation thread ID
 * @param currentState - Current state with pending edit
 */
export async function handleConfirmation(
  userId: string,
  action: "confirm" | "cancel",
  threadId: string,
  currentState: PlanChatbotState,
): Promise<{
  response: PlanChatMessage;
  state: PlanChatbotState;
}> {
  try {
    console.log(`🤖 [plan-chatbot-2] Handling confirmation action: ${action}`);

    if (action === "cancel") {
      // User cancelled the operation
      return {
        response: {
          role: "assistant",
          content: MESSAGES.CANCELLED,
        },
        state: {
          ...currentState,
          waitingForConfirmation: false,
          pendingEdit: null,
        },
      };
    }

    // User confirmed - execute the pending edit
    if (!currentState.pendingEdit) {
      return {
        response: {
          role: "assistant",
          content:
            "There's no pending operation to confirm. What would you like to do?",
        },
        state: {
          ...currentState,
          waitingForConfirmation: false,
        },
      };
    }

    // Execute the edit
    const result = await executeEdit(
      userId,
      currentState.pendingEdit as PendingEdit,
    );

    if (result.success) {
      return {
        response: {
          role: "assistant",
          content: result.message ?? "Changes applied successfully!",
        },
        state: {
          ...currentState,
          waitingForConfirmation: false,
          pendingEdit: null,
        },
      };
    } else {
      return {
        response: {
          role: "assistant",
          content: `Failed to apply changes: ${result.error ?? "Unknown error"}`,
        },
        state: {
          ...currentState,
          waitingForConfirmation: false,
          pendingEdit: null,
        },
      };
    }
  } catch (error) {
    console.error("❌ [plan-chatbot-2] Error handling confirmation:", error);

    return {
      response: {
        role: "assistant",
        content: MESSAGES.ERROR,
      },
      state: {
        ...currentState,
        waitingForConfirmation: false,
        pendingEdit: null,
      },
    };
  }
}

/**
 * Get a greeting message for a new conversation
 */
export function getGreetingMessage(userName?: string): PlanChatMessage {
  return {
    role: "assistant",
    content: MESSAGES.GREETING(userName),
  };
}

/**
 * Reset the conversation state for a user
 * @param threadId - The thread ID to reset
 */
export async function resetConversation(threadId: string): Promise<void> {
  // The MemorySaver will automatically handle this when a new conversation starts
  // with the same thread ID after the user refreshes the page
  console.log(`🔄 [plan-chatbot-2] Conversation reset for thread: ${threadId}`);
}

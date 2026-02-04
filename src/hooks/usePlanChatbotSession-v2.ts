import { useState, useCallback } from "react";
import {
  processPlanChatMessageV2,
  initializePlanChatSessionV2,
} from "@/actions/plan/plan-chat-v2";
import type {
  PlanChatMessage,
  PlanChatbotState,
} from "@/ai/agents/plan-chatbot-2/types";

interface PlanChatbotSessionStateV2 {
  messages: PlanChatMessage[];
  input: string;
  loading: boolean;
  threadId: string;
  isInitialized: boolean;
  agentState: PlanChatbotState | null;
}

interface ErrorResponse {
  success: false;
  error: string;
}

const isErrorResponse = (obj: unknown): obj is ErrorResponse => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj as Record<string, unknown>).success === false
  );
};

export function usePlanChatbotSessionV2() {
  // Thread ID will be set by server after user auth verification
  // Using null as placeholder until server initializes chat
  const [threadId, setThreadId] = useState<string | null>(null);

  const [state, setState] = useState<PlanChatbotSessionStateV2>({
    messages: [],
    input: "",
    loading: false,
    threadId: threadId || "",
    isInitialized: false,
    agentState: null,
  });

  // Initialize chat when user clicks start button
  const initializeChat = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await initializePlanChatSessionV2();

      // Check if result is an error response
      if (isErrorResponse(result)) {
        console.error("Failed to initialize plan chat (v2):", result.error);
        setState((prev) => ({
          ...prev,
          messages: [
            {
              role: "assistant",
              content: "Failed to initialize chat. Please try again.",
            },
          ],
          loading: false,
          isInitialized: true,
        }));
        return;
      }

      if (result.threadId) {
        setThreadId(result.threadId);
      }
      setState((prev) => ({
        ...prev,
        messages: Array.isArray(result.messages) ? result.messages : [],
        loading: false,
        isInitialized: true,
        threadId: result.threadId || prev.threadId,
        agentState: result.state || null,
      }));
    } catch (error) {
      console.error("Failed to initialize plan chat session (v2):", error);
      setState((prev) => ({
        ...prev,
        messages: [
          {
            role: "assistant",
            content: "Failed to initialize chat. Please try again.",
          },
        ],
        loading: false,
        isInitialized: true,
      }));
    }
  }, []);

  // Handle sending messages
  const handleSend = useCallback(
    async (messageText?: string) => {
      const textToSend = messageText || state.input;
      if (!textToSend.trim()) return;

      setState((prev) => ({
        ...prev,
        input: "",
        messages: [
          ...prev.messages,
          {
            role: "user",
            content: textToSend,
          },
        ],
        loading: true,
      }));

      try {
        const result = await processPlanChatMessageV2(
          textToSend,
          state.threadId,
          state.agentState || undefined,
        );

        // Check if result is an error response
        if (isErrorResponse(result)) {
          setState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                role: "assistant",
                content:
                  result.error || "I encountered an error. Please try again.",
              },
            ],
            loading: false,
          }));
          return;
        }

        // Add assistant messages from the server response
        const assistantMessages = Array.isArray(result.messages)
          ? result.messages.filter((msg) => msg.role === "assistant")
          : [];

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, ...assistantMessages],
          loading: false,
          agentState: result.state || prev.agentState,
        }));
      } catch (error) {
        console.error("Failed to process plan chat message (v2):", error);
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: "An error occurred. Please try again.",
            },
          ],
          loading: false,
        }));
      }
    },
    [state.input, state.threadId, state.agentState],
  );

  // Handle action button clicks
  const handleActionClick = useCallback(
    (action: string) => {
      // Extract readable label from action
      const displayText = action.startsWith("action:")
        ? action.replace("action:", "").charAt(0).toUpperCase() +
          action.replace("action:", "").slice(1)
        : action;

      // Add user message with readable text
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "user",
            content: displayText,
          },
        ],
        loading: true,
      }));

      // Send the actual action to backend
      (async () => {
        try {
          const result = await processPlanChatMessageV2(
            action,
            state.threadId,
            state.agentState || undefined,
          );

          // Check if result is an error response
          if (isErrorResponse(result)) {
            setState((prev) => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  role: "assistant",
                  content:
                    result.error || "I encountered an error. Please try again.",
                },
              ],
              loading: false,
            }));
            return;
          }

          // Add assistant messages from the server response
          const assistantMessages = Array.isArray(result.messages)
            ? result.messages.filter((msg) => msg.role === "assistant")
            : [];

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, ...assistantMessages],
            loading: false,
            agentState: result.state || prev.agentState,
          }));
        } catch (error) {
          console.error("Failed to process plan chat message (v2):", error);
          setState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                role: "assistant",
                content: "An error occurred. Please try again.",
              },
            ],
            loading: false,
          }));
        }
      })();
    },
    [state.threadId, state.agentState],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (e.key === "Enter" && !state.loading) {
        // Prevent default to avoid newline when pressing Enter if desired
        e.preventDefault();
        handleSend();
      }
    },
    [state.loading, handleSend],
  );

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }));
  }, []);

  return {
    ...state,
    handleSend,
    handleInputKeyDown,
    handleActionClick,
    setInput,
    initializeChat,
  };
}

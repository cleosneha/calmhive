import { useState, useCallback } from "react";
import {
  processPlanChatMessage,
  initializePlanChatSession,
} from "@/actions/plan/plan-chat";
import type { PlanChatMessage } from "@/ai/agents/plan-chatbot/types";

interface PlanChatbotSessionState {
  messages: PlanChatMessage[];
  input: string;
  loading: boolean;
  threadId: string;
  isInitialized: boolean;
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

export function usePlanChatbotSession() {
  const [threadId] = useState(() => `plan-chat-${Date.now()}`);

  const [state, setState] = useState<PlanChatbotSessionState>({
    messages: [],
    input: "",
    loading: false,
    threadId,
    isInitialized: false,
  });

  // Initialize chat when user clicks start button
  const initializeChat = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await initializePlanChatSession(threadId);

      // Check if result is an error response
      if (isErrorResponse(result)) {
        console.error("Failed to initialize plan chat:", result.error);
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

      setState((prev) => ({
        ...prev,
        messages: Array.isArray(result.messages) ? result.messages : [],
        loading: false,
        isInitialized: true,
      }));
    } catch (error) {
      console.error("Failed to initialize plan chat session:", error);
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
  }, [threadId]);

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
        const result = await processPlanChatMessage(textToSend, state.threadId);

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

        // Only add assistant messages from the server response, not user messages
        // (user message was already added locally above)
        const assistantMessages = Array.isArray(result.messages)
          ? result.messages.filter((msg) => msg.role === "assistant")
          : [];

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, ...assistantMessages],
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to process plan chat message:", error);
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
    [state.input, state.threadId]
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
          const result = await processPlanChatMessage(action, state.threadId);

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

          // Only add assistant messages from the server response
          const assistantMessages = Array.isArray(result.messages)
            ? result.messages.filter((msg) => msg.role === "assistant")
            : [];

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, ...assistantMessages],
            loading: false,
          }));
        } catch (error) {
          console.error("Failed to process plan chat message:", error);
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
    [state.threadId]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !state.loading) {
        handleSend();
      }
    },
    [state.loading, handleSend]
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

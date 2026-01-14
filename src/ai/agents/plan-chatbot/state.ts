import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

/**
 * Plan Chatbot Agent State
 * Shared state across all nodes in the plan chatbot flow
 */
export const PlanChatbotState = Annotation.Root({
  // Inherit messages from MessagesAnnotation (handles message array properly)
  ...MessagesAnnotation.spec,

  // User identification
  userId: Annotation<string>,
  userName: Annotation<string>,

  // Current plan data (fetched from DB)
  planId: Annotation<number | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Flow control
  waitingForConfirmation: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // Store pending edit for confirmation
  pendingEdit: Annotation<{
    type:
      | "add_task"
      | "remove_task"
      | "modify_task"
      | "change_days_off"
      | "other";
    data: Record<string, unknown>;
    description: string;
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Conversation mode
  mode: Annotation<"query" | "edit" | "confirm">({
    reducer: (_, value) => value,
    default: () => "query",
  }),
});

export type PlanChatbotStateType = typeof PlanChatbotState.State;

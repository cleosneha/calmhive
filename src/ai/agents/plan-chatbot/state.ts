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
      | "add_days_off"
      | "remove_days"
      | "copy_day"
      | "rename_day"
      | "swap_days"
      | "delete_plan"
      | "modify_task_bulk"
      | "other";
    data: Record<string, unknown>;
    description: string;
    preview?: {
      before?: string;
      after?: string;
      changes?: Array<{ field: string; oldValue?: string; newValue: string }>;
    };
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Store last executed edit for undo
  lastEdit: Annotation<{
    type:
      | "add_task"
      | "remove_task"
      | "modify_task"
      | "change_days_off"
      | "add_days_off"
      | "remove_days"
      | "delete_plan"
      | "copy_day"
      | "rename_day"
      | "swap_days"
      | "modify_task_bulk"
      | "other";
    data: Record<string, unknown>;
    previousData?: Record<string, unknown>;
    description: string;
    timestamp: number;
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Conversation mode
  mode: Annotation<"query" | "edit" | "confirm" | "undo">({
    reducer: (_, value) => value,
    default: () => "query",
  }),

  // Track awaiting clarification for multi-step operations
  awaitingClarification: Annotation<{
    operation:
      | "swap_days"
      | "remove_days"
      | "copy_day"
      | "rename_day"
      | "add_days_off"
      | "add_task"
      | "modify_task"
      | "modify_task_bulk"
      | null;
    context?: Record<string, unknown>;
  } | null>({
    reducer: (_, value) => value,
    default: () => null,
  }),

  // Flag to handle undo request
  isUndoRequest: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),

  // Cache answer from combined LLM call to avoid duplicate invocation
  cachedAnswer: Annotation<string | undefined>({
    reducer: (_, value) => value,
    default: () => undefined,
  }),

  // Flag to indicate response was already handled in analyze node (safety/irrelevant)
  responseHandled: Annotation<boolean>({
    reducer: (_, value) => value,
    default: () => false,
  }),
});

export type PlanChatbotStateType = typeof PlanChatbotState.State;

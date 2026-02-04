/**
 * plan-chatbot-2 - Wellness Plan Chatbot using LangChain createAgent
 *
 * Features:
 * - Gemini as primary model with Mistral fallback
 * - Summarization middleware (keeps last 3 messages)
 * - All plan operations: add/remove/modify tasks, day operations
 * - Confirmation flow with preview before execution
 */

export {
  createPlanChatbotAgent,
  processMessage,
  handleConfirmation,
  getGreetingMessage,
  resetConversation,
} from "./agent";

export type {
  PlanChatMessage,
  PendingEdit,
  EditType,
  PlanChatbotState,
  EditPreview,
  PreviewChange,
  ToolResult,
  ValidationResult,
  PlanInfo,
  TaskInfo,
} from "./types";

export { MESSAGES } from "./utils/hardcoded-messages";

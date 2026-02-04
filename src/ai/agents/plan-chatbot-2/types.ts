/**
 * Types for plan-chatbot-2
 */

export interface PlanChatMessage {
  role: "assistant" | "user";
  content: string;
  actions?: Array<{
    type: "confirm" | "cancel";
    label: string;
  }>;
}

export interface PreviewChange {
  field: string;
  oldValue?: string;
  newValue: string;
}

export interface EditPreview {
  before?: string;
  after?: string;
  changes?: PreviewChange[];
}

export type EditType =
  | "add_task"
  | "remove_task"
  | "modify_task"
  | "add_days_off"
  | "remove_days"
  | "copy_day"
  | "rename_day"
  | "swap_days"
  | "delete_plan";

export interface PendingEdit {
  type: EditType;
  data: Record<string, unknown>;
  description: string;
  preview?: EditPreview;
}

export interface TaskInfo {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  notes?: string | null;
  status: string;
}

export interface PlanInfo {
  id: number;
  userId: string;
  daysOff: string[];
  tasks: TaskInfo[];
}

export interface ToolResult {
  success: boolean;
  requiresConfirmation?: boolean;
  pendingEdit?: PendingEdit;
  message: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedDays?: string[];
  existingDays?: string[];
  missingDays?: string[];
  conflictingDays?: string[];
}

// Agent state types
export interface PlanChatbotState {
  messages: unknown[];
  userId: string;
  waitingForConfirmation: boolean;
  pendingEdit: PendingEdit | null;
  summary?: string;
}

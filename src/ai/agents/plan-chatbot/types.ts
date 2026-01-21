export interface PlanChatMessage {
  role: "assistant" | "user";
  content: string;
  actions?: Array<{
    type: "confirm" | "cancel" | "undo";
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

export interface EditAnalysisResult {
  isEditRequest: boolean;
  isSafe: boolean;
  isRelevant: boolean;
  quotaExceeded?: boolean;
  editType?:
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
    | "other";
  extractedEdit?: {
    day?: string;
    timeRange?: string;
    oldActivity?: string; // For modify_task - what's being replaced
    activity?: string; // For add_task/modify_task - new activity name
    notes?: string; // AI-generated notes for the activity
    taskId?: number;
    daysOff?: string[];
    isLastTask?: boolean; // For remove_task - indicates if this is the last task in plan
    // Day operation fields
    daysToAdd?: string[]; // For add_days_off
    daysToRemove?: string[]; // For remove_days
    sourceDay?: string; // For copy_day, rename_day, swap_days
    targetDay?: string; // For copy_day, rename_day, swap_days
    day1?: string; // For swap_days
    day2?: string; // For swap_days
    needsConfirmation?: boolean; // For operations requiring user confirmation
    confirmationType?: "copy" | "rename" | "swap" | "remove" | "add_days_off"; // Type of confirmation needed
  };
  safetyIssue?: string;
  suggestion?: string;
}

export interface PlanQueryResult {
  answer: string;
  relatedTasks?: Array<{
    id: number;
    day: string;
    timeRange: string;
    activity: string;
    status: string;
  }>;
}

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
    | "other";
  extractedEdit?: {
    day?: string;
    timeRange?: string;
    oldActivity?: string; // For modify_task - what's being replaced
    activity?: string; // For add_task/modify_task - new activity name
    notes?: string; // AI-generated notes for the activity
    taskId?: number;
    daysOff?: string[];
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

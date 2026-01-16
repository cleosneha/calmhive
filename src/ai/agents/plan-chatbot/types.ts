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
  editType?:
    | "add_task"
    | "remove_task"
    | "modify_task"
    | "change_days_off"
    | "other";
  extractedEdit?: {
    day?: string;
    timeRange?: string;
    activity?: string;
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

export interface LLMValidationResult {
  isRelevant: boolean;
  hasSafetyIssue: boolean;
  hasExpectationMismatch: boolean;
  userWantsToSkip: boolean; // User explicitly wants to skip this question
  modificationRequired: boolean; // User wants to modify a previous response
  modifiedField?: string; // Which field user wants to modify (e.g., "age", "goals")
  modifiedValue?: string; // The new value for the field
  mismatchMessage?: string;
  suggestBestTime?: string;
  followUpText?: string;
  isGoalQuestion?: boolean;
  goalSpecificQuestion?: string; // Contextual follow-up question for goal
  goalOptions?: string[]; // Answer options for the goal-specific question
  readiness?: "yes" | "no";
}

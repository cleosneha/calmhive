/**
 * Insights-related types for CalmHive
 */

/**
 * Key pattern structure for insights
 */
export interface KeyPattern {
  pattern: string;
  observation: string;
}

/**
 * Suggestion structure for insights
 */
export interface Suggestion {
  title: string;
  description: string;
  actionable?: boolean;
}

/**
 * Insight from database
 */
export interface Insight {
  id: number;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  title: string;
  narrativeSummary: string;
  keyPatterns: KeyPattern[]; // Stored as JSON in DB
  suggestions: Suggestion[]; // Stored as JSON in DB
  taskCompletionRate: number;
  journalFrequency: number;
  generatedAt: Date;
}

/**
 * Create insight input
 */
export interface CreateInsightInput {
  weekStartDate: Date | string;
  weekEndDate: Date | string;
  title: string;
  narrativeSummary: string;
  keyPatterns: KeyPattern[];
  suggestions: Suggestion[];
  taskCompletionRate: number;
  journalFrequency: number;
}

/**
 * Insight with user data
 */
export interface InsightWithUser extends Insight {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

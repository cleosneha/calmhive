/**
 * CalmHive Type Definitions
 * Central export point for all TypeScript types and interfaces
 */

// API Types
export type {
  ApiResponse,
  ApiError,
  HttpStatusCode,
  ErrorResponse,
} from "./api";

// Auth Types
export type {
  BetterAuthSession,
  SessionCallbackParams,
  AuthLayoutProps,
  AuthLeftSectionProps,
  LoginFormValues,
  RegisterFormValues,
  OTPVerificationFormValues,
  AuthActionResponse,
} from "./auth";

// Common Types
export type {
  ActionResult,
  PaginationParams,
  PaginatedResponse,
  DateRange,
  SortOrder,
  SortParams,
} from "./common";

// Component Types
export type {
  LayoutProps,
  AuthenticatedLayoutProps,
  PageParams,
  JournalEntryPageParams,
  InsightPageParams,
} from "./component";

// Insight Types
export type {
  KeyPattern,
  Suggestion,
  Insight,
  CreateInsightInput,
  InsightWithUser,
} from "./insight";

// Journal Types
export type {
  JournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  JournalEntryWithUser,
} from "./journal";

// Onboarding Types
export type {
  OnboardingQuestion,
  OnboardingMessage,
  OnboardingState,
  OnboardingSessionResponse,
  OnboardingLayoutProps,
} from "./onboarding";

// Plan Types
export type {
  TaskPriority,
  TaskStatus,
  Task,
  Plan,
  CreatePlanInput,
  UpdatePlanInput,
  PlanWithUser,
} from "./plan";

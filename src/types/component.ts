/**
 * Common component props types for CalmHive
 */

/**
 * Base props for layouts with children
 */
export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Authenticated user layout props
 */
export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Page params for dynamic routes
 */
export interface PageParams<
  T extends Record<string, string> = Record<string, string>
> {
  params: Promise<T>;
}

/**
 * Journal entry page params
 */
export interface JournalEntryPageParams {
  params: Promise<{ entryId: string }>;
}

/**
 * Insight page params
 */
export interface InsightPageParams {
  params: Promise<{ weekId: string }>;
}

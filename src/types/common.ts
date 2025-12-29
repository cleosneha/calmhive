/**
 * Common/shared types used across CalmHive
 */

/**
 * Generic action result
 */
export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort params
 */
export interface SortParams {
  field: string;
  order: SortOrder;
}

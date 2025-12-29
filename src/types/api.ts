/**
 * API-related types for CalmHive
 */

/**
 * Standard API response structure for consistent data formatting
 */
export interface ApiResponse<T = unknown> {
  status: "success";
  data: T;
  message?: string;
}

/**
 * Standard API error structure for consistent error handling
 */
export interface ApiError {
  status: "error";
  error: string;
  code?: string;
}

/**
 * HTTP Status codes commonly used
 */
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

/**
 * Error response type
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  statusCode?: HttpStatusCode;
}

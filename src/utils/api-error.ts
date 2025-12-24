/**
 * Standard API error structure for consistent error handling
 */
interface ApiError {
  status: "error";
  error: string;
  code?: string;
}

/**
 * Create an API error response
 * @param error - Error message
 * @param code - Optional error code
 * @returns Formatted API error
 */
export function apiError(error: string, code?: string): ApiError {
  return {
    status: "error",
    error,
    ...(code && { code }),
  };
}

/**
 * Create an error response for Next.js API routes
 * @param error - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Optional error code
 * @returns Next.js Response object
 */
export function apiJsonError(
  error: string,
  statusCode: number = 500,
  code?: string
): Response {
  return Response.json(apiError(error, code), { status: statusCode });
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

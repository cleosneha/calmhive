import type { ApiResponse } from "@/types";

/**
 * Create a success API response with consistent formatting
 * @param data - The response data
 * @param message - Optional success message
 * @returns Formatted API response
 */
export function apiResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    status: "success",
    data,
    ...(message && { message }),
  };
}

/**
 * Create a success response for Next.js API routes
 * @param data - The response data
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 * @returns Next.js Response object
 */
export function apiJsonResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return Response.json(apiResponse(data, message), { status: statusCode });
}

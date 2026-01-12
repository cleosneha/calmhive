/**
 * AI Error Handler Utility
 * Provides consistent error handling across all AI/LLM operations
 */

const RATE_LIMIT_ERROR_MESSAGE =
  "AI service limits are exhausted. Please try again after some time.";

const RATE_LIMIT_ERROR_CODE = 429;

/**
 * Check if error is a rate limit (429) error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  // Check for GoogleGenerativeAI 429 error
  if (error instanceof Error) {
    if (
      error.message.includes("429") ||
      error.message.includes("Too Many Requests")
    ) {
      return true;
    }
    if (error.message.includes("quota") || error.message.includes("exceeded")) {
      return true;
    }
  }

  // Check for error object with status code
  if (typeof error === "object" && "status" in error) {
    if (error.status === 429 || error.status === RATE_LIMIT_ERROR_CODE) {
      return true;
    }
  }

  return false;
}

/**
 * Get standardized error message based on error type
 */
export function getAIErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return RATE_LIMIT_ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An error occurred while processing your request. Please try again.";
}

/**
 * Handle AI errors and return standardized response
 */
export function handleAIError(error: unknown): {
  error: string;
  code: string;
  isRateLimit: boolean;
} {
  const isRateLimit = isRateLimitError(error);
  const errorMessage = getAIErrorMessage(error);

  return {
    error: isRateLimit ? RATE_LIMIT_ERROR_MESSAGE : errorMessage,
    code: isRateLimit ? "RATE_LIMIT_EXCEEDED" : "AI_ERROR",
    isRateLimit,
  };
}

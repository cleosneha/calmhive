/**
 * Validate time availability response
 * Ensures realistic time values (between 15 minutes and 5 hours)
 * Supports formats: "2 hrs", "1.5 hours", "90 minutes", "90" (assumes minutes)
 */
import { parseAndMapTime } from "./time-utils";

export function validateTimeResponse(response: string): {
  isValid: boolean;
  errorMessage?: string;
  mappedRange?: string; // "Less than 30 minutes.", "30-60 minutes.", or "More than 60 minutes."
} {
  const parsed = parseAndMapTime(response);

  // If it's not a time-based response, keep existing behavior
  if (parsed.mins === null) return { isValid: true };

  if (!parsed.isValid) {
    return { isValid: false, errorMessage: parsed.errorMessage };
  }

  return { isValid: true, mappedRange: parsed.mappedRange };
}

/**
 * Check if question is asking about time availability
 */
export function isTimeQuestion(questionText: string): boolean {
  return questionText.toLowerCase().includes("time");
}

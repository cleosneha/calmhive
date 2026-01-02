/**
 * Validate time availability response
 * Ensures realistic time values (between 1 minute and 24 hours)
 */
export function validateTimeResponse(response: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Check if response contains digits
  if (!/\d/.test(response)) {
    return { isValid: true }; // Not a time-based response
  }

  // Match both positive and negative numbers
  const hoursMatch = response.match(/(-?\d{1,2})\s*(hours|hrs|h)/i);
  const minsMatch = response.match(/(-?\d{1,4})\s*(minutes|min|m)/i);

  let totalMins = 0;
  if (hoursMatch) totalMins += parseInt(hoursMatch[1], 10) * 60;
  if (minsMatch) totalMins += parseInt(minsMatch[1], 10);

  // Reject negative or zero time, or time greater than 24 hours
  if (totalMins > 1440 || totalMins <= 0) {
    return {
      isValid: false,
      errorMessage:
        "Please enter a realistic time (between 1 minute and 24 hours).",
    };
  }

  return { isValid: true };
}

/**
 * Check if question is asking about time availability
 */
export function isTimeQuestion(questionText: string): boolean {
  return questionText.toLowerCase().includes("time");
}

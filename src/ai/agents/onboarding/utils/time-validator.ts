/**
 * Validate time availability response
 * Ensures realistic time values (between 15 minutes and 5 hours)
 * Supports formats: "2 hrs", "1.5 hours", "90 minutes", "90" (assumes minutes)
 */
export function validateTimeResponse(response: string): {
  isValid: boolean;
  errorMessage?: string;
  mappedRange?: string; // "Less than 30 minutes.", "30-60 minutes.", or "More than 60 minutes."
} {
  // Check if response contains digits
  if (!/\d/.test(response)) {
    return { isValid: true }; // Not a time-based response
  }

  // Match hours (supports decimals like 1.5)
  const hoursMatch = response.match(/(-?\d+(?:\.\d+)?)\s*(hours|hrs|h)\b/i);
  // Match minutes
  const minsMatch = response.match(/(-?\d+(?:\.\d+)?)\s*(minutes|min|m)\b/i);
  // Match plain number (assume minutes if no unit specified)
  const plainNumberMatch = response.match(/^\s*(-?\d+(?:\.\d+)?)\s*$/);

  let totalMins = 0;
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    totalMins += hours * 60;
  }
  if (minsMatch) {
    const mins = parseFloat(minsMatch[1]);
    totalMins += mins;
  }
  if (!hoursMatch && !minsMatch && plainNumberMatch) {
    // Plain number - assume minutes
    totalMins = parseFloat(plainNumberMatch[1]);
  }

  // Round to nearest integer
  totalMins = Math.round(totalMins);

  // Stricter validation: 15 mins to 5 hours (300 mins)
  if (totalMins < 15 || totalMins > 300) {
    return {
      isValid: false,
      errorMessage:
        "Please enter a realistic time between 15 minutes and 5 hours.",
    };
  }

  // Map to range
  let mappedRange: string;
  if (totalMins < 30) {
    mappedRange = "Less than 30 minutes.";
  } else if (totalMins <= 60) {
    mappedRange = "30-60 minutes.";
  } else {
    mappedRange = "More than 60 minutes.";
  }

  return { isValid: true, mappedRange };
}

/**
 * Check if question is asking about time availability
 */
export function isTimeQuestion(questionText: string): boolean {
  return questionText.toLowerCase().includes("time");
}

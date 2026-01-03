/**
 * Validate time availability response
 * Ensures realistic time values (between 15 minutes and 5 hours)
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

  // Match both positive and negative numbers
  const hoursMatch = response.match(/(-?\d{1,2})\s*(hours|hrs|h)/i);
  const minsMatch = response.match(/(-?\d{1,4})\s*(minutes|min|m)/i);

  let totalMins = 0;
  if (hoursMatch) totalMins += parseInt(hoursMatch[1], 10) * 60;
  if (minsMatch) totalMins += parseInt(minsMatch[1], 10);

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

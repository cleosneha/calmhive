/**
 * Parse time input to minutes
 * Supports: "2 hrs", "1.5 hours", "90 minutes", "90", "30 minutes."
 */
export function parseTimeToMinutes(userInput: string): number {
  const hoursMatch = userInput.match(/(-?\d+(?:\.\d+)?)\s*(hours|hrs|h)\b/i);
  const minsMatch = userInput.match(/(-?\d+(?:\.\d+)?)\s*(minutes|min|m)\b/i);
  const plainNumberMatch = userInput.match(/^\s*(-?\d+(?:\.\d+)?)\s*$/);

  let totalMins = 0;
  if (hoursMatch) {
    totalMins += parseFloat(hoursMatch[1]) * 60;
  }
  if (minsMatch) {
    totalMins += parseFloat(minsMatch[1]);
  }
  if (!hoursMatch && !minsMatch && plainNumberMatch) {
    // Plain number - assume minutes
    totalMins = parseFloat(plainNumberMatch[1]);
  }

  return Math.round(totalMins);
}

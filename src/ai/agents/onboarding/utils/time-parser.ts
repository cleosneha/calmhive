/**
 * Parse time input to minutes
 * Supports: "2 hrs", "1.5 hours", "90 minutes", "90", "30 minutes.",
 *           "1h30", "1:30", "2 hr", "45 mins"
 */
export function parseTimeToMinutes(userInput: string): number {
  const s = (userInput || "").trim();

  // Colon format e.g. 1:30
  const colonMatch = s.match(/^\s*(-?\d{1,2})\s*[:]\s*(\d{1,2})\s*$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    return Math.round(hours * 60 + mins);
  }

  // Combined format e.g. 1h30 or 1hr 30min
  const combinedMatch = s.match(
    /(-?\d+(?:\.\d+)?)\s*h(?:r|rs|ours?)?\.?\s*(?:(\d+(?:\.\d+)?)\s*(?:m(?:in(?:ute)?s?)?)?)?$/i
  );
  if (combinedMatch) {
    let total = parseFloat(combinedMatch[1]) * 60;
    if (combinedMatch[2]) total += parseFloat(combinedMatch[2]);
    return Math.round(total);
  }

  // Fallback: separate hours/mins tokens like "2 hr" or "45 mins"
  const hoursMatch = s.match(/(-?\d+(?:\.\d+)?)\s*(hours|hrs|hr|h)\b/i);
  const minsMatch = s.match(
    /(-?\d+(?:\.\d+)?)\s*(minutes|mins|min|m|minute)\b/i
  );
  const plainNumberMatch = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*$/);

  let totalMins = 0;
  if (hoursMatch) totalMins += parseFloat(hoursMatch[1]) * 60;
  if (minsMatch) totalMins += parseFloat(minsMatch[1]);
  if (!hoursMatch && !minsMatch && plainNumberMatch) {
    // Plain number - assume minutes
    totalMins = parseFloat(plainNumberMatch[1]);
  }

  return Math.round(totalMins);
}

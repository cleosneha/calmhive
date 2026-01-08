/**
 * Parse and map time input to minutes and a mapped range label
 */
export function parseAndMapTime(response: string): {
  mins: number | null;
  isValid: boolean;
  mappedRange?: string;
  errorMessage?: string;
} {
  const s = (response || "").trim();

  // If no digits, treat it as a non-time response
  if (!/\d/.test(s)) return { mins: null, isValid: true };

  // Colon format e.g. 1:30
  const colonMatch = s.match(/^\s*(-?\d{1,2})\s*[:]\s*(\d{1,2})\s*$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    const total = Math.round(hours * 60 + mins);
    if (total < 15 || total > 300)
      return {
        mins: total,
        isValid: false,
        errorMessage:
          "Please enter a realistic time between 15 minutes and 5 hours.",
      };

    const mappedRange =
      total < 30
        ? "Less than 30 minutes."
        : total <= 60
        ? "30-60 minutes."
        : "More than 60 minutes.";
    return { mins: total, isValid: true, mappedRange };
  }

  // Combined format e.g. 1h30 or 1hr 30min
  const combinedMatch = s.match(
    /(-?\d+(?:\.\d+)?)\s*h(?:r|rs|ours?)?\.?\s*(?:(\d+(?:\.\d+)?)\s*(?:m(?:in(?:ute)?s?)?)?)?$/i
  );
  if (combinedMatch) {
    let total = parseFloat(combinedMatch[1]) * 60;
    if (combinedMatch[2]) total += parseFloat(combinedMatch[2]);
    total = Math.round(total);
    if (total < 15 || total > 300)
      return {
        mins: total,
        isValid: false,
        errorMessage:
          "Please enter a realistic time between 15 minutes and 5 hours.",
      };

    const mappedRange =
      total < 30
        ? "Less than 30 minutes."
        : total <= 60
        ? "30-60 minutes."
        : "More than 60 minutes.";
    return { mins: total, isValid: true, mappedRange };
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
  if (!hoursMatch && !minsMatch && plainNumberMatch)
    totalMins = parseFloat(plainNumberMatch[1]);

  totalMins = Math.round(totalMins);

  // Stricter validation: 15 mins to 5 hours (300 mins)
  if (totalMins < 15 || totalMins > 300) {
    return {
      mins: totalMins,
      isValid: false,
      errorMessage:
        "Please enter a realistic time between 15 minutes and 5 hours.",
    };
  }

  let mappedRange: string;
  if (totalMins < 30) mappedRange = "Less than 30 minutes.";
  else if (totalMins <= 60) mappedRange = "30-60 minutes.";
  else mappedRange = "More than 60 minutes.";

  return { mins: totalMins, isValid: true, mappedRange };
}

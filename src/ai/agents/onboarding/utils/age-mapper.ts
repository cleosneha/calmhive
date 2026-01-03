/**
 * Age range mapping utility
 * Maps numeric age or age range strings to standardized age range keys
 */
export function mapAgeToRange(input: string): string | null {
  const trimmed = input.trim().toLowerCase();

  // Check if input matches predefined age range options
  const ageRanges = ["under 18", "18-24", "25-34", "35-44", "45-54", "55+"];
  if (ageRanges.some((range) => range === trimmed)) {
    return input.trim();
  }

  // Try to extract numeric age (allow optional sign and detect negatives)
  // Reject explicit negative mentions like "-5" or "minus 5"
  if (/\bminus\b|\bnegative\b|[-−]\d+/i.test(trimmed)) {
    return null;
  }

  const ageMatch = input.match(/-?\d{1,3}/);
  if (!ageMatch) return null;

  const rawAge = ageMatch[0];
  // Reject if the matched value has a negative sign
  if (rawAge.startsWith("-") || rawAge.startsWith("−")) return null;

  const age = parseInt(rawAge, 10);

  // Accept only realistic human ages between 4 and 110
  if (isNaN(age) || age < 4 || age > 110) return null;

  // Map numeric age to range
  if (age < 18) return "Under 18";
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  if (age >= 55) return "55+";

  return null;
}

/**
 * Check if question is asking for age
 */
export function isAgeQuestion(questionText: string): boolean {
  return (
    questionText.toLowerCase().includes("age range") ||
    questionText.toLowerCase().includes("age")
  );
}

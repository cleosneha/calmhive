/**
 * Date of Birth utility - Helper functions only
 * All LLM validation is handled in dob-handler.ts via prompt-builder.ts
 */

/**
 * Check if question is asking for date of birth
 */
export function isDateOfBirthQuestion(questionText: string): boolean {
  const lowerText = questionText.toLowerCase();
  return (
    lowerText.includes("date of birth") ||
    lowerText.includes("birth date") ||
    lowerText.includes("dob") ||
    lowerText.includes("when were you born") ||
    lowerText.includes("dd/mm/yyyy") ||
    lowerText.includes("mm/dd/yyyy")
  );
}

/**
 * Format date to DD/MM/YYYY string
 */
export function formatDateToDDMMYYYY(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

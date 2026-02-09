/**
 * Date of Birth utility - Helper functions for DOB validation
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

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dateOfBirth.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Map age to age range string
 */
export function mapAgeToRange(age: number): string {
  if (age < 18) return "Under 18";
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  if (age >= 55) return "55+";

  return "Unknown";
}

/**
 * Validate date components and create Date object
 */
export function validateAndCreateDate(
  day: number,
  month: number,
  year: number,
): { valid: boolean; date?: Date; error?: string } {
  const currentYear = new Date().getUTCFullYear();

  // Validate ranges
  if (day < 1 || day > 31) {
    return { valid: false, error: "Day must be between 1 and 31." };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: "Month must be between 1 and 12." };
  }

  if (year < 1900 || year > currentYear) {
    return {
      valid: false,
      error: `Year must be between 1900 and ${currentYear}.`,
    };
  }

  // Check day validity for month (including leap year)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return {
      valid: false,
      error: `${monthNames[month - 1]} ${year} has only ${daysInMonth} days.`,
    };
  }

  const dateOfBirth = new Date(Date.UTC(year, month - 1, day));

  // Check if future date
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (dateOfBirth > today) {
    return {
      valid: false,
      error: "Date of birth cannot be in the future.",
    };
  }

  // Calculate and validate age
  const age = calculateAge(dateOfBirth);

  if (age < 4) {
    return {
      valid: false,
      error: "You must be at least 4 years old to use CalmHive.",
    };
  }

  if (age > 110) {
    return {
      valid: false,
      error:
        "Please enter a valid date of birth. The age seems unusually high.",
    };
  }

  return { valid: true, date: dateOfBirth };
}

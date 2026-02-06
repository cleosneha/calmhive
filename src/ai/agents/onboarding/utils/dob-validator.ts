/**
 * Date of Birth validation utility
 * Validates date format (DD/MM/YYYY) and calculates age
 */

interface DOBValidationResult {
  isValid: boolean;
  dateOfBirth?: Date;
  age?: number;
  ageRange?: string;
  errorMessage?: string;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dateOfBirth.getUTCMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Map age to age range
 */
function mapAgeToRange(age: number): string {
  if (age < 18) return "Under 18";
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  if (age >= 55) return "55+";

  return "Unknown";
}

/**
 * Get month name from month number (1-12)
 */
function getMonthName(monthNum: number): string {
  const months = [
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
  return months[monthNum - 1] || "Invalid Month";
}

/**
 * Validate date of birth input
 * Extracts DD/MM/YYYY format from anywhere in the user input
 * Rejects future dates
 * Ensures age is between 4 and 110
 */
export function validateDateOfBirth(input: string): DOBValidationResult {
  const trimmed = input.trim();

  console.log("[DOB Validator] Input:", trimmed);

  // Extract DD/MM/YYYY pattern from anywhere in the input
  // This allows natural language like "it is 15/03/1990" or "my dob is 15/03/1990"
  const datePattern = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
  const match = trimmed.match(datePattern);

  console.log("[DOB Validator] Regex match result:", match);

  if (!match) {
    return {
      isValid: false,
      errorMessage:
        "Please enter your date of birth in DD/MM/YYYY format (e.g., 15/03/1990).",
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic validation: day should be 1-31
  if (day < 1 || day > 31) {
    return {
      isValid: false,
      errorMessage: "Invalid day. Please enter a day between 01 and 31.",
    };
  }

  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      errorMessage: "Invalid month. Please enter a month between 01 and 12.",
    };
  }

  // Validate year is reasonable (between 1900 and current year)
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear) {
    return {
      isValid: false,
      errorMessage: `Please enter a year between 1900 and ${currentYear}.`,
    };
  }

  // Validate day based on month (handles 28/29/30/31 days and leap years)
  // Using new Date(year, month, 0).getDate() automatically handles:
  // - February 28 in non-leap years
  // - February 29 in leap years (divisible by 4, except century years not divisible by 400)
  // - 30 days in April, June, September, November
  // - 31 days in January, March, May, July, August, October, December
  const daysInMonth = new Date(year, month, 0).getDate();

  if (day < 1 || day > daysInMonth) {
    return {
      isValid: false,
      errorMessage: `Invalid day for ${getMonthName(month)}. This month has ${daysInMonth} days. Please enter a valid day.`,
    };
  }

  // Create date object using UTC to avoid timezone offset issues
  // Month parameter is 0-indexed for Date constructor (0=January, 11=December)
  const dateOfBirth = new Date(Date.UTC(year, month - 1, day));

  // Check if date is in the future
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (dateOfBirth > today) {
    return {
      isValid: false,
      errorMessage:
        "Date of birth cannot be in the future. Please enter a valid date.",
    };
  }

  // Calculate age
  const age = calculateAge(dateOfBirth);

  // Validate age range (4 to 110)
  if (age < 4) {
    return {
      isValid: false,
      errorMessage: "You must be at least 4 years old to use CalmHive.",
    };
  }

  if (age > 110) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid date of birth.",
    };
  }

  // Map age to range
  const ageRange = mapAgeToRange(age);

  return {
    isValid: true,
    dateOfBirth,
    age,
    ageRange,
  };
}

/**
 * Check if question is asking for date of birth
 */
export function isDateOfBirthQuestion(questionText: string): boolean {
  const lowerText = questionText.toLowerCase();
  return (
    lowerText.includes("date of birth") ||
    lowerText.includes("birth date") ||
    lowerText.includes("dob") ||
    lowerText.includes("when were you born")
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
 * Parse DD/MM/YYYY string to Date object
 * Extracts the date pattern from anywhere in the string
 */
export function parseDDMMYYYY(dateString: string): Date | null {
  const datePattern = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
  const match = dateString.trim().match(datePattern);

  console.log("[parseDDMMYYYY] Input:", dateString);
  console.log("[parseDDMMYYYY] Regex match:", match);

  if (!match) {
    console.log("[parseDDMMYYYY] No match found");
    return null;
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  console.log(
    `[parseDDMMYYYY] Extracted - Day: ${day}, Month: ${month}, Year: ${year}`,
  );

  // Use UTC to avoid timezone offset issues that shift dates backwards
  const date = new Date(Date.UTC(year, month - 1, day));
  console.log("[parseDDMMYYYY] Created Date object:", date);

  return date;
}

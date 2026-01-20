/**
 * Insights Filter Types
 * Defines type-safe filter options for insights dashboard
 */

export type YearOption = number; // Actual year number (2026, 2025, etc.)
export type PeriodOption = "current-month" | "current-year";

export interface InsightsFilterState {
  year: YearOption;
  period: PeriodOption;
}

export interface FilterChangeParams {
  year: YearOption;
  period: PeriodOption;
}

/**
 * Get display label for year option
 */
export function getYearLabel(year: YearOption): string {
  return year.toString();
}

/**
 * Get display label for period option
 */
export function getPeriodLabel(period: PeriodOption): string {
  return period === "current-month" ? "Current Month" : "Current Year";
}

/**
 * Check if period option is available for given year
 */
export function isPeriodAvailable(
  period: PeriodOption,
  year: YearOption,
): boolean {
  const currentYear = new Date().getFullYear();
  // Current Month only available for current year
  if (period === "current-month") {
    return year === currentYear;
  }
  // Current Year available for all
  return true;
}

/**
 * Get available period options for given year
 */
export function getAvailablePeriods(year: YearOption): PeriodOption[] {
  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    return ["current-month", "current-year"];
  }
  return ["current-year"];
}

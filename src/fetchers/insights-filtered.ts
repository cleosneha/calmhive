/**
 * Fetchers for filtered insights data
 * Handles data retrieval based on time period filters
 */

import { prisma } from "@/lib/db";
import {
  getWeeksInMonth,
  getMonthsInYear,
  getCurrentMonthYear,
} from "@/utils/insights-date-helper";

export type FilterType = "current-month" | "current-year" | "previous-year";

interface FilteredTimeSpentData {
  week: string;
  timeSpent: number;
}

interface FilteredCompletionData {
  week: string;
  completionRate: number;
}

interface FilteredHolidaysData {
  week: string;
  holidays: number;
}

/**
 * Fetch time spent data based on filter
 */
export async function getFilteredTimeSpentData(
  userId: string,
  filterType: FilterType,
  year?: number,
): Promise<FilteredTimeSpentData[]> {
  if (filterType === "current-month") {
    return await getCurrentMonthTimeSpent(userId);
  } else if (filterType === "current-year") {
    return await getCurrentYearTimeSpent(userId);
  } else if (filterType === "previous-year" && year) {
    return await getPreviousYearTimeSpent(userId, year);
  }
  return [];
}

/**
 * Fetch completion rate data based on filter
 */
export async function getFilteredCompletionData(
  userId: string,
  filterType: FilterType,
  year?: number,
): Promise<FilteredCompletionData[]> {
  if (filterType === "current-month") {
    return await getCurrentMonthCompletion(userId);
  } else if (filterType === "current-year") {
    return await getCurrentYearCompletion(userId);
  } else if (filterType === "previous-year" && year) {
    return await getPreviousYearCompletion(userId, year);
  }
  return [];
}

/**
 * Fetch holidays data based on filter
 */
export async function getFilteredHolidaysData(
  userId: string,
  filterType: FilterType,
  year?: number,
): Promise<FilteredHolidaysData[]> {
  if (filterType === "current-month") {
    return await getCurrentMonthHolidays(userId);
  } else if (filterType === "current-year") {
    return await getCurrentYearHolidays(userId);
  } else if (filterType === "previous-year" && year) {
    return await getPreviousYearHolidays(userId, year);
  }
  return [];
}

/**
 * CURRENT MONTH - Time Spent (Weekly)
 */
async function getCurrentMonthTimeSpent(
  userId: string,
): Promise<FilteredTimeSpentData[]> {
  const { month, year } = getCurrentMonthYear();
  const weeks = getWeeksInMonth(year, month);

  const result: FilteredTimeSpentData[] = [];

  for (const week of weeks) {
    const insights = await prisma.insight.findMany({
      where: {
        userId,
        weekStartDate: {
          gte: week.start,
          lte: week.end,
        },
      },
      select: {
        averageTimeSpent: true,
      },
    });

    const totalTime = insights.reduce(
      (sum, insight) => sum + (insight.averageTimeSpent || 0),
      0,
    );

    result.push({
      week: week.weekLabel,
      timeSpent: Math.round(totalTime),
    });
  }

  return result;
}

/**
 * CURRENT YEAR - Time Spent (Monthly)
 */
async function getCurrentYearTimeSpent(
  userId: string,
): Promise<FilteredTimeSpentData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredTimeSpentData[] = [];

  for (const monthData of months) {
    // Skip future months
    if (monthData.month > currentMonth) {
      continue;
    }

    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: monthData.month,
        },
      },
      select: {
        averageTimeSpent: true,
      },
    });

    result.push({
      week: monthData.label,
      timeSpent: Math.round(monthlyInsight?.averageTimeSpent || 0),
    });
  }

  return result;
}

/**
 * PREVIOUS YEAR - Time Spent (Monthly)
 */
async function getPreviousYearTimeSpent(
  userId: string,
  year: number,
): Promise<FilteredTimeSpentData[]> {
  const months = getMonthsInYear();
  const result: FilteredTimeSpentData[] = [];

  for (const monthData of months) {
    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month: monthData.month,
        },
      },
      select: {
        averageTimeSpent: true,
      },
    });

    result.push({
      week: monthData.label,
      timeSpent: Math.round(monthlyInsight?.averageTimeSpent || 0),
    });
  }

  return result;
}

/**
 * CURRENT MONTH - Completion Rate (Weekly)
 */
async function getCurrentMonthCompletion(
  userId: string,
): Promise<FilteredCompletionData[]> {
  const { month, year } = getCurrentMonthYear();
  const weeks = getWeeksInMonth(year, month);

  const result: FilteredCompletionData[] = [];

  for (const week of weeks) {
    const insights = await prisma.insight.findMany({
      where: {
        userId,
        weekStartDate: {
          gte: week.start,
          lte: week.end,
        },
      },
      select: {
        totalTasks: true,
        completedTasks: true,
      },
    });

    let totalTasks = 0;
    let completedTasks = 0;

    for (const insight of insights) {
      totalTasks += insight.totalTasks || 0;
      completedTasks += insight.completedTasks || 0;
    }

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    result.push({
      week: week.weekLabel,
      completionRate: Math.round(completionRate),
    });
  }

  return result;
}

/**
 * CURRENT YEAR - Completion Rate (Monthly)
 */
async function getCurrentYearCompletion(
  userId: string,
): Promise<FilteredCompletionData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredCompletionData[] = [];

  for (const monthData of months) {
    if (monthData.month > currentMonth) {
      continue;
    }

    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: monthData.month,
        },
      },
      select: {
        completionRate: true,
      },
    });

    result.push({
      week: monthData.label,
      completionRate: Math.round(monthlyInsight?.completionRate || 0),
    });
  }

  return result;
}

/**
 * PREVIOUS YEAR - Completion Rate (Monthly)
 */
async function getPreviousYearCompletion(
  userId: string,
  year: number,
): Promise<FilteredCompletionData[]> {
  const months = getMonthsInYear();
  const result: FilteredCompletionData[] = [];

  for (const monthData of months) {
    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month: monthData.month,
        },
      },
      select: {
        completionRate: true,
      },
    });

    result.push({
      week: monthData.label,
      completionRate: Math.round(monthlyInsight?.completionRate || 0),
    });
  }

  return result;
}

/**
 * CURRENT MONTH - Holidays (Weekly)
 */
async function getCurrentMonthHolidays(
  userId: string,
): Promise<FilteredHolidaysData[]> {
  const { month, year } = getCurrentMonthYear();
  const weeks = getWeeksInMonth(year, month);

  const result: FilteredHolidaysData[] = [];

  for (const week of weeks) {
    const holidays = await prisma.holiday.count({
      where: {
        userId,
        date: {
          gte: week.start,
          lte: week.end,
        },
      },
    });

    result.push({
      week: week.weekLabel,
      holidays,
    });
  }

  return result;
}

/**
 * CURRENT YEAR - Holidays (Monthly)
 */
async function getCurrentYearHolidays(
  userId: string,
): Promise<FilteredHolidaysData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredHolidaysData[] = [];

  for (const monthData of months) {
    if (monthData.month > currentMonth) {
      continue;
    }

    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: monthData.month,
        },
      },
      select: {
        holidaysTaken: true,
      },
    });

    result.push({
      week: monthData.label,
      holidays: monthlyInsight?.holidaysTaken || 0,
    });
  }

  return result;
}

/**
 * PREVIOUS YEAR - Holidays (Monthly)
 */
async function getPreviousYearHolidays(
  userId: string,
  year: number,
): Promise<FilteredHolidaysData[]> {
  const months = getMonthsInYear();
  const result: FilteredHolidaysData[] = [];

  for (const monthData of months) {
    const monthlyInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month: monthData.month,
        },
      },
      select: {
        holidaysTaken: true,
      },
    });

    result.push({
      week: monthData.label,
      holidays: monthlyInsight?.holidaysTaken || 0,
    });
  }

  return result;
}

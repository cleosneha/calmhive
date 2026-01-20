"use cache";

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
import { YearOption, PeriodOption } from "@/types/insights-filter";

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
  year: YearOption,
  period: PeriodOption,
): Promise<FilteredTimeSpentData[]> {
  if (period === "current-month") {
    return await getCurrentMonthTimeSpent(userId);
  } else {
    // Current Year view - monthly breakdown
    return await getYearTimeSpent(userId, year);
  }
}

/**
 * Fetch completion rate data based on filter
 */
export async function getFilteredCompletionData(
  userId: string,
  year: YearOption,
  period: PeriodOption,
): Promise<FilteredCompletionData[]> {
  if (period === "current-month") {
    return await getCurrentMonthCompletion(userId);
  } else {
    return await getYearCompletion(userId, year);
  }
}

/**
 * Fetch holidays data based on filter
 */
export async function getFilteredHolidaysData(
  userId: string,
  year: YearOption,
  period: PeriodOption,
): Promise<FilteredHolidaysData[]> {
  if (period === "current-month") {
    return await getCurrentMonthHolidays(userId);
  } else {
    return await getYearHolidays(userId, year);
  }
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
 * CURRENT YEAR/PREVIOUS YEAR - Time Spent (Monthly)
 */
async function getYearTimeSpent(
  userId: string,
  year: number,
): Promise<FilteredTimeSpentData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredTimeSpentData[] = [];

  for (const monthData of months) {
    // Skip future months for current year
    if (year === currentYear && monthData.month > currentMonth) {
      continue;
    }

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
 * CURRENT YEAR/PREVIOUS YEAR - Completion Rate (Monthly)
 */
async function getYearCompletion(
  userId: string,
  year: number,
): Promise<FilteredCompletionData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredCompletionData[] = [];

  for (const monthData of months) {
    if (year === currentYear && monthData.month > currentMonth) {
      continue;
    }

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
 * CURRENT YEAR/PREVIOUS YEAR - Holidays (Monthly)
 */
async function getYearHolidays(
  userId: string,
  year: number,
): Promise<FilteredHolidaysData[]> {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = getMonthsInYear();

  const result: FilteredHolidaysData[] = [];

  for (const monthData of months) {
    if (year === currentYear && monthData.month > currentMonth) {
      continue;
    }

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

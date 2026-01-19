/**
 * Insights Aggregation Helper
 * Functions to aggregate weekly insights into monthly data
 */

import { prisma } from "@/lib/db";
import { getMonthRange } from "./insights-date-helper";

interface MonthlyAggregateResult {
  totalTasks: number;
  completedTasks: number;
  partialTasks: number;
  averageTimeSpent: number;
  completionRate: number;
  holidaysTaken: number;
}

/**
 * Aggregate weekly insights into monthly data for a specific month
 */
export async function aggregateMonthlyData(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlyAggregateResult> {
  const { start, end } = getMonthRange(year, month);

  // Fetch all weekly insights for this month
  const weeklyInsights = await prisma.insight.findMany({
    where: {
      userId,
      weekStartDate: {
        gte: start,
        lte: end,
      },
    },
    select: {
      totalTasks: true,
      completedTasks: true,
      partialTasks: true,
      averageTimeSpent: true,
    },
  });

  // Fetch holidays for this month
  const holidays = await prisma.holiday.count({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // Aggregate data
  let totalTasks = 0;
  let completedTasks = 0;
  let partialTasks = 0;
  let totalTimeSpent = 0;
  let weeksWithData = 0;

  for (const insight of weeklyInsights) {
    totalTasks += insight.totalTasks || 0;
    completedTasks += insight.completedTasks || 0;
    partialTasks += insight.partialTasks?.length || 0;
    totalTimeSpent += insight.averageTimeSpent || 0;
    weeksWithData++;
  }

  const averageTimeSpent =
    weeksWithData > 0 ? totalTimeSpent / weeksWithData : 0;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    partialTasks,
    averageTimeSpent,
    completionRate,
    holidaysTaken: holidays,
  };
}

/**
 * Store or update monthly insight data
 */
export async function upsertMonthlyInsight(
  userId: string,
  year: number,
  month: number,
  data: MonthlyAggregateResult,
) {
  return await prisma.monthlyInsight.upsert({
    where: {
      userId_year_month: {
        userId,
        year,
        month,
      },
    },
    create: {
      userId,
      year,
      month,
      ...data,
    },
    update: data,
  });
}

/**
 * Aggregate and store monthly data for entire year (including current month)
 */
export async function aggregateYearData(userId: string, year: number) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Determine which months to process
  const endMonth = year === currentYear ? currentMonth : 12;

  const results = [];

  for (let month = 1; month <= endMonth; month++) {
    const monthlyData = await aggregateMonthlyData(userId, year, month);
    const result = await upsertMonthlyInsight(userId, year, month, monthlyData);
    results.push(result);
  }

  return results;
}

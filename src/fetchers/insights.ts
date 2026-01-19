import { prisma } from "@/lib/db";
import { getWeekBounds } from "@/ai/agents/insights";
import {
  calculateTaskStatistics,
  calculateAverageTimeSpent,
  calculateConsistencyScore,
  analyzeDayPerformance,
} from "@/actions/insights/helper";

interface CurrentWeekInsight {
  totalTasks: number;
  completedTasks: number;
  partialTasks: number;
  pendingTasks: number;
  consistencyScore: number;
  averageTimeSpent: number;
  topPerformingDay: string;
  suggestions: string | null;
  planSuggestions: string | null;
  weekStart: Date;
  weekEnd: Date;
}

interface WeeklyTrendData {
  week: string;
  completionRate: number;
  timeSpent: number;
  holidays: number;
}

interface JournalStats {
  entriesThisWeek: number;
  totalEntries: number;
}

/**
 * Fetch current week's insight data from database
 */
export async function getCurrentWeekInsight(
  userId: string,
): Promise<CurrentWeekInsight | null> {
  "use cache";
  const { weekStart, weekEnd } = getWeekBounds();

  // Try to fetch from Insight table first
  const insight = await prisma.insight.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: weekStart,
      },
    },
  });

  if (insight) {
    return {
      totalTasks: insight.totalTasks ?? 0,
      completedTasks: insight.completedTasks ?? 0,
      partialTasks: insight.partialTasks?.length ?? 0,
      pendingTasks:
        (insight.totalTasks ?? 0) -
        (insight.completedTasks ?? 0) -
        (insight.partialTasks?.length ?? 0),
      consistencyScore: insight.consistencyScore ?? 0,
      averageTimeSpent: insight.averageTimeSpent ?? 0,
      topPerformingDay: insight.topPerformingDay ?? "N/A",
      suggestions: insight.suggestions,
      planSuggestions: insight.planSuggestions,
      weekStart: insight.weekStartDate,
      weekEnd: insight.weekEndDate,
    };
  }

  // If no insight exists, calculate from live data
  const plan = await prisma.plan.findUnique({
    where: { userId },
    include: {
      tasks: {
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      },
    },
  });

  if (!plan || plan.tasks.length === 0) {
    return null;
  }

  const stats = calculateTaskStatistics(plan.tasks);
  const avgTime = calculateAverageTimeSpent(plan.tasks);
  const consistency = calculateConsistencyScore(
    stats.completed,
    stats.partial,
    stats.total,
  );
  const dayPerformance = analyzeDayPerformance(plan.tasks);
  const topDay =
    Object.entries(dayPerformance).sort(
      (a, b) => b[1].completed - a[1].completed,
    )[0]?.[0] ?? "N/A";

  return {
    totalTasks: stats.total,
    completedTasks: stats.completed,
    partialTasks: stats.partial,
    pendingTasks: stats.pending,
    consistencyScore: parseFloat(consistency.toFixed(2)),
    averageTimeSpent: parseFloat(avgTime.toFixed(2)),
    topPerformingDay: topDay,
    suggestions: null,
    planSuggestions: null,
    weekStart,
    weekEnd,
  };
}

/**
 * Fetch historical insights for trend graphs (last 4-8 weeks)
 */
export async function getHistoricalInsights(
  userId: string,
  weeks: number = 8,
): Promise<WeeklyTrendData[]> {
  "use cache";
  const insights = await prisma.insight.findMany({
    where: { userId },
    orderBy: { weekStartDate: "desc" },
    take: weeks,
  });

  // Reverse to show oldest to newest
  return insights.reverse().map((insight) => {
    const weekLabel = formatWeekLabel(insight.weekStartDate);
    const completionRate =
      insight.totalTasks && insight.completedTasks
        ? (insight.completedTasks / insight.totalTasks) * 100
        : 0;

    return {
      week: weekLabel,
      completionRate: parseFloat(completionRate.toFixed(1)),
      timeSpent: insight.averageTimeSpent ?? 0,
      holidays: 0, // Will be calculated separately
    };
  });
}

/**
 * Fetch holiday count for each week (last 8 weeks)
 */
export async function getWeeklyHolidays(
  userId: string,
  weeks: number = 8,
): Promise<WeeklyTrendData[]> {
  "use cache";
  const { weekStart } = getWeekBounds();
  const startDate = new Date(weekStart);
  startDate.setDate(startDate.getDate() - weeks * 7);

  const holidays = await prisma.holiday.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    orderBy: { date: "asc" },
  });

  // Group by week
  const weeklyData: Record<string, number> = {};
  for (const holiday of holidays) {
    const weekLabel = getWeekLabelForDate(holiday.date);
    weeklyData[weekLabel] = (weeklyData[weekLabel] || 0) + 1;
  }

  // Create array for last N weeks
  const result: WeeklyTrendData[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() - i * 7);
    const label = formatWeekLabel(date);
    result.push({
      week: label,
      completionRate: 0,
      timeSpent: 0,
      holidays: weeklyData[label] || 0,
    });
  }

  return result;
}

/**
 * Get holidays count for current week
 */
export async function getCurrentWeekHolidays(userId: string): Promise<number> {
  "use cache";
  const { weekStart, weekEnd } = getWeekBounds();

  const count = await prisma.holiday.count({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  return count;
}

/**
 * Fetch journal statistics
 */
export async function getJournalStats(userId: string): Promise<JournalStats> {
  "use cache";
  const { weekStart, weekEnd } = getWeekBounds();

  const [entriesThisWeek, totalEntries] = await Promise.all([
    prisma.journalEntry.count({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),
    prisma.journalEntry.count({
      where: { userId },
    }),
  ]);

  return {
    entriesThisWeek,
    totalEntries,
  };
}

/**
 * Fetch user profile data for insights
 */
export async function getUserProfileData(userId: string) {
  "use cache";
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      badges: true,
    },
  });

  return user;
}

/**
 * Get combined insights data for dashboard
 */
export async function getDashboardInsights(userId: string) {
  "use cache";
  const [
    currentWeek,
    historical,
    holidays,
    holidaysThisWeek,
    journal,
    profile,
  ] = await Promise.all([
    getCurrentWeekInsight(userId),
    getHistoricalInsights(userId),
    getWeeklyHolidays(userId),
    getCurrentWeekHolidays(userId),
    getJournalStats(userId),
    getUserProfileData(userId),
  ]);

  // Merge completion and time data with holidays
  const trendData = historical.map((item, index) => ({
    ...item,
    holidays: holidays[index]?.holidays || 0,
  }));

  return {
    currentWeek,
    trendData,
    holidaysThisWeek,
    journal,
    profile,
  };
}

// Helper functions
function formatWeekLabel(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getWeekLabelForDate(date: Date): string {
  const dayOfWeek = date.getDay();
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayOfWeek);
  return formatWeekLabel(weekStart);
}

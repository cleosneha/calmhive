"use server";

import { prisma } from "@/lib/db";
import {
  generateWeeklySuggestions,
  getWeekBounds,
  getPreviousWeekBounds,
} from "@/ai/agents/insights";
import {
  calculateTaskStatistics,
  calculateAverageTimeSpent,
  calculateConsistencyScore,
  calculateTrendingCompletion,
  analyzeDayPerformance,
  getTopPerformingDay,
  roundTo,
  validateInsightData,
  createTaskSummary,
} from "./insights/helper";

interface InsightData {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  partialTasks: string[];
  averageTimeSpent: number;
  consistencyScore: number;
  trendingCompletion: number;
  topPerformingDay: string;
  suggestions: string;
  planSuggestions: string;
}

/**
 * Fetch user's plan with tasks for a given week
 */
async function fetchUserWeeklyPlan(
  userId: string,
  weekStart: Date,
  weekEnd: Date,
) {
  return prisma.plan.findUnique({
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
}

/**
 * Fetch previous week's insight for comparison
 */
async function fetchPreviousInsight(userId: string, previousWeekStart: Date) {
  return prisma.insight.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: previousWeekStart,
      },
    },
  });
}

/**
 * Calculate insights for a single user's weekly performance
 */
async function calculateUserInsights(
  userId: string,
  weekStart: Date,
  weekEnd: Date,
): Promise<InsightData | null> {
  try {
    // Fetch user's plan with all tasks for the week
    const plan = await fetchUserWeeklyPlan(userId, weekStart, weekEnd);

    if (!plan || plan.tasks.length === 0) {
      return null; // Skip users without plans or tasks
    }

    const { tasks } = plan;

    // Calculate all statistics using helper functions
    const stats = calculateTaskStatistics(tasks);
    const averageTimeSpent = calculateAverageTimeSpent(tasks);
    const consistencyScore = calculateConsistencyScore(
      stats.completed,
      stats.partial,
      stats.total,
    );

    // Collect partial task activities with time range for AI analysis
    const partialTaskActivities = tasks
      .filter((task) => task.status === "partial")
      .map((task) => `${task.activity} (${task.timeRange})`);

    // Get previous week's data for trending calculation
    const { weekStart: previousWeekStart } = getPreviousWeekBounds(weekStart);
    const previousInsight = await fetchPreviousInsight(
      userId,
      previousWeekStart,
    );

    const trendingCompletion = calculateTrendingCompletion(
      stats.completed,
      stats.total,
      previousInsight?.completedTasks ?? null,
      previousInsight?.totalTasks ?? null,
    );

    // Analyze day performance and get top day
    const dayPerformance = analyzeDayPerformance(tasks);
    const topPerformingDay = getTopPerformingDay(dayPerformance);

    // Validate calculated data
    const insightData = {
      totalTasks: stats.total,
      completedTasks: stats.completed,
      averageTimeSpent: roundTo(averageTimeSpent),
      consistencyScore: roundTo(consistencyScore),
    };

    if (!validateInsightData(insightData)) {
      // console.error(`[INSIGHTS] Invalid data for user ${userId}:`, insightData);
      return null;
    }

    // Generate AI suggestions using LLM
    const aiResponse = await generateWeeklySuggestions({
      totalTasks: stats.total,
      completedTasks: stats.completed,
      partialTasks: stats.partial,
      partialTaskActivities,
      consistencyScore: roundTo(consistencyScore),
      trendingCompletion: roundTo(trendingCompletion),
      topPerformingDay,
      averageTimeSpent: roundTo(averageTimeSpent),
      tasks: createTaskSummary(tasks),
      onboardingData: {
        goals: "",
        activities: "",
        timeAvailability: 0,
        energeticTime: "",
        daysOff: [],
      },
      currentPlan: [],
    });

    return {
      userId,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      partialTasks: partialTaskActivities,
      averageTimeSpent: roundTo(averageTimeSpent),
      consistencyScore: roundTo(consistencyScore),
      trendingCompletion: roundTo(trendingCompletion),
      topPerformingDay,
      suggestions: aiResponse.weeklyFeedback,
      planSuggestions: aiResponse.planSuggestions,
    };
  } catch (error) {
    console.error(`[INSIGHTS] Error calculating for user ${userId}:`, error);
    return null;
  }
}

/**
 * Upsert insight data to database
 */
async function upsertInsight(
  userId: string,
  weekStart: Date,
  weekEnd: Date,
  insightData: InsightData,
) {
  return prisma.insight.upsert({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: weekStart,
      },
    },
    create: {
      userId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalTasks: insightData.totalTasks,
      completedTasks: insightData.completedTasks,
      partialTasks: insightData.partialTasks,
      averageTimeSpent: insightData.averageTimeSpent,
      consistencyScore: insightData.consistencyScore,
      trendingCompletion: insightData.trendingCompletion,
      topPerformingDay: insightData.topPerformingDay,
      suggestions: insightData.suggestions,
      planSuggestions: insightData.planSuggestions,
    },
    update: {
      totalTasks: insightData.totalTasks,
      completedTasks: insightData.completedTasks,
      partialTasks: insightData.partialTasks,
      averageTimeSpent: insightData.averageTimeSpent,
      consistencyScore: insightData.consistencyScore,
      trendingCompletion: insightData.trendingCompletion,
      topPerformingDay: insightData.topPerformingDay,
      suggestions: insightData.suggestions,
      planSuggestions: insightData.planSuggestions,
    },
  });
}

/**
 * Fetch all users with plans
 */
async function fetchUsersWithPlans() {
  return prisma.user.findMany({
    where: {
      plan: {
        isNot: null,
      },
    },
    select: {
      id: true,
    },
  });
}

/**
 * Generate weekly insights for all users
 * Called by cron job every Sunday at 23:59
 */
export async function generateWeeklyInsights() {
  try {
    const { weekStart, weekEnd } = getWeekBounds();

    // console.log( `[INSIGHTS] Generating insights for week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

    // Fetch all users with plans
    const users = await fetchUsersWithPlans();

    if (users.length === 0) {
      return {
        success: true,
        message: "No users with plans found",
        data: { processed: 0, created: 0, skipped: 0 },
      };
    }

    let created = 0;
    let skipped = 0;

    // Process each user sequentially to avoid overwhelming the DB/LLM
    for (const user of users) {
      const insightData = await calculateUserInsights(
        user.id,
        weekStart,
        weekEnd,
      );

      if (!insightData) {
        skipped++;
        continue;
      }

      // Upsert insight (create or update if exists)
      await upsertInsight(user.id, weekStart, weekEnd, insightData);

      created++;
      // console.log(`[INSIGHTS] Created insight for user: ${user.id}`);
    }

    return {
      success: true,
      message: `Weekly insights generated successfully`,
      data: {
        processed: users.length,
        created,
        skipped,
      },
    };
  } catch (error) {
    console.error("[INSIGHTS] Error generating weekly insights:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

/**
 * Fetch insights for a specific user and week
 */
export async function getUserInsights(userId: string, weekStart: Date) {
  try {
    const insight = await prisma.insight.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekStart,
        },
      },
    });

    if (!insight) {
      return {
        success: false,
        message: "No insights found for this week",
        data: null,
      };
    }

    return {
      success: true,
      message: "Insights fetched successfully",
      data: insight,
    };
  } catch (error) {
    console.error("[INSIGHTS] Error fetching user insights:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

/**
 * Get all insights for a user (ordered by week)
 */
export async function getAllUserInsights(userId: string) {
  try {
    const insights = await prisma.insight.findMany({
      where: { userId },
      orderBy: { weekStartDate: "desc" },
    });

    return {
      success: true,
      message: "All insights fetched successfully",
      data: insights,
    };
  } catch (error) {
    console.error("[INSIGHTS] Error fetching all insights:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

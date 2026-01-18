"use server";

import prisma from "@/lib/db";
import { formatHoursHuman } from "@/utils/formatting";
import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Fetch user's plan with tasks and holidays for current week
 * @param userId - The user ID (passed from authenticated context)
 */
export async function fetchUserPlan(userId: string): Promise<
  | ApiResponse<{
      plan: {
        id: number;
        userId: string;
        daysOff: string[];
        hoursSummary: Record<string, number> | null;
        createdAt: Date;
        updatedAt: Date;
        tasks: {
          id: number;
          day: string;
          timeRange: string;
          activity: string;
          status: string;
          notes: string | null;
        }[];
        holidays: Array<{
          id: number;
          date: Date;
          reason: string | null;
        }>;
      } | null;
    }>
  | ApiError
> {
  try {
    // Calculate current week's date range (Sunday to Saturday)
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch plan and holidays in parallel for optimal performance
    const [planData, holidays] = await Promise.all([
      prisma.plan.findUnique({
        where: {
          userId,
        },
        include: {
          tasks: {
            orderBy: [{ day: "asc" }, { timeRange: "asc" }],
          },
        },
      }),
      prisma.holiday.findMany({
        where: {
          userId,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          id: true,
          date: true,
          reason: true,
        },
        orderBy: {
          date: "asc",
        },
      }),
    ]);

    // Type cast hoursSummary to ensure TypeScript compatibility
    const numericHours = planData
      ? (planData.hoursSummary as Record<string, number> | null) || null
      : null;

    const hoursSummaryHuman = numericHours
      ? Object.fromEntries(
          Object.entries(numericHours).map(([k, v]) => [
            k,
            formatHoursHuman(v),
          ]),
        )
      : null;

    const plan = planData
      ? {
          ...planData,
          hoursSummary: numericHours,
          hoursSummaryHuman,
          holidays,
        }
      : null;

    return {
      status: "success",
      data: { plan },
      message: plan ? "Plan fetched successfully" : "No plan found",
    };
  } catch (error) {
    console.error("Error fetching plan:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to fetch plan",
      code: "INTERNAL_ERROR",
    };
  }
}

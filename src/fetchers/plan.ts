"use server";

import prisma from "@/lib/db";
import { formatHoursHuman } from "@/utils/formatting";
import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Fetch user's active plan with tasks
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
        tasks: Array<{
          id: number;
          planId: number;
          day: string;
          timeRange: string;
          activity: string;
          status: string;
          notes: string | null;
          personalNotes: string;
        }>;
      } | null;
    }>
  | ApiError
> {
  try {
    const planData = await prisma.plan.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        daysOff: true,
        hoursSummary: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            id: true,
            planId: true,
            day: true,
            timeRange: true,
            activity: true,
            status: true,
            notes: true,
            personalNotes: true,
          },
          orderBy: [{ day: "asc" }, { timeRange: "asc" }],
        },
      },
    });

    if (!planData) {
      return {
        status: "success",
        data: { plan: null },
        message: "No plan found",
      };
    }

    const hoursSummary =
      (planData.hoursSummary as Record<string, number> | null) || null;

    return {
      status: "success",
      data: {
        plan: {
          ...planData,
          hoursSummary,
        },
      },
      message: "Plan fetched successfully",
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

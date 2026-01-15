"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import { formatHoursHuman } from "@/utils/formatting";
import type { ApiResponse, ApiError } from "@/types/api";

/**
 * Fetch user's plan with tasks
 */
export async function fetchUserPlan(): Promise<
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
      } | null;
    }>
  | ApiError
> {
  try {
    // Layout already ensures user is authenticated via requireOnboarding()
    const user = await getCurrentUser();
    const userId = user!.id; // Non-null assertion safe here

    const planData = await prisma.plan.findUnique({
      where: {
        userId,
      },
      include: {
        tasks: {
          orderBy: [{ day: "asc" }, { timeRange: "asc" }],
        },
      },
    });

    // Type cast hoursSummary to ensure TypeScript compatibility
    const numericHours = planData
      ? (planData.hoursSummary as Record<string, number> | null) || null
      : null;

    const hoursSummaryHuman = numericHours
      ? Object.fromEntries(
          Object.entries(numericHours).map(([k, v]) => [k, formatHoursHuman(v)])
        )
      : null;

    const plan = planData
      ? {
          ...planData,
          hoursSummary: numericHours,
          hoursSummaryHuman,
        }
      : null;
    console.log("Fetched plan for user:", userId, plan);
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

"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";
import type { ApiResponse, ApiError } from "@/types/api";

export async function checkPlanExistence(): Promise<
  ApiResponse<{ exists: boolean }> | ApiError
> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        status: "error",
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      };
    }

    const plan = await prisma.plan.findFirst({
      where: { userId: user.id },
    });

    return {
      status: "success",
      data: { exists: !!plan },
      message: plan ? "Plan exists" : "No plan found",
    };
  } catch (error) {
    console.error("Error checking plan existence:", error);
    return {
      status: "error",
      error: "Failed to check plan",
      code: "INTERNAL_ERROR",
    };
  }
}

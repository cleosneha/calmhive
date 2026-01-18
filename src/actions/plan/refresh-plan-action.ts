"use server";

import { getCurrentUser } from "@/actions/auth";
import { fetchUserPlan } from "@/fetchers/plan";

/**
 * Server action to refresh plan data for the current user
 */
export async function refreshPlanAction() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    const result = await fetchUserPlan(user.id);

    if (result.status === "error") {
      return {
        success: false,
        message: result.error,
        data: null,
      };
    }

    return {
      success: true,
      message: "Plan refreshed successfully",
      data: result.data.plan,
    };
  } catch (error) {
    console.error("Error refreshing plan:", error);
    return {
      success: false,
      message: "Failed to refresh plan",
      data: null,
    };
  }
}

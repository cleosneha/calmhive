"use server";

import { getCurrentUser } from "@/actions/auth";
import { fetchUserPlan } from "@/fetchers/plan";

/**
 * Server action to refresh plan data for the current user
 */
export async function refreshPlanAction() {
  console.log("[refreshPlanAction] Starting plan refresh");
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      console.log("[refreshPlanAction] No user found");
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    console.log("[refreshPlanAction] Fetching plan for user:", user.id);
    const result = await fetchUserPlan(user.id);

    if (result.status === "error") {
      console.log("[refreshPlanAction] Fetch failed:", result.error);
      return {
        success: false,
        message: result.error,
        data: null,
      };
    }

    console.log("[refreshPlanAction] Plan fetched successfully");
    return {
      success: true,
      message: "Plan refreshed successfully",
      data: result.data.plan,
    };
  } catch (error) {
    console.error("[refreshPlanAction] Error:", error);
    return {
      success: false,
      message: "Failed to refresh plan",
      data: null,
    };
  }
}

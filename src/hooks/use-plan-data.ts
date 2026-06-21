"use client";

import { useState, useCallback } from "react";
import { refreshPlanAction } from "@/actions/plan/refresh-plan-action";

interface Plan {
  id: number;
  userId: string;
  daysOff: string[];
  hoursSummary: Record<string, number> | null;
  hoursSummaryHuman?: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: Array<{
    id: number;
    day: string;
    timeRange: string;
    activity: string;
    status: string;
    notes: string | null;
  }>;
  holidays: Array<{
    id: number;
    date: Date;
    reason: string | null;
  }>;
}

export function usePlanData(initialPlan: Plan) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPlan = useCallback(async () => {
    // console.log("[usePlanData] Starting plan refresh");
    setIsRefreshing(true);
    try {
      const result = await refreshPlanAction();
      if (result.success && result.data) {
        // console.log("[usePlanData] Plan refresh successful, updating state");
        setPlan(result.data);
        return { success: true };
      }
      // console.log("[usePlanData] Plan refresh failed:", result.message);
      return { success: false, error: result.message };
    } catch (error) {
      console.error("Error refreshing plan:", error);
      return { success: false, error: "Failed to refresh plan" };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { plan, setPlan, refreshPlan, isRefreshing };
}

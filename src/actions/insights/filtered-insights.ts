"use server";

import {
  getFilteredTimeSpentData,
  getFilteredCompletionData,
  getFilteredHolidaysData,
  FilterType,
} from "@/fetchers/insights-filtered";

/**
 * Server action to fetch filtered time spent data
 */
export async function getTimeSpentData(
  userId: string,
  filterType: FilterType,
  year?: number,
) {
  try {
    const data = await getFilteredTimeSpentData(userId, filterType, year);
    return { success: true, data };
  } catch (error) {
    console.error("[ACTION] Error fetching time spent data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch data",
      data: [],
    };
  }
}

/**
 * Server action to fetch filtered completion data
 */
export async function getCompletionData(
  userId: string,
  filterType: FilterType,
  year?: number,
) {
  try {
    const data = await getFilteredCompletionData(userId, filterType, year);
    return { success: true, data };
  } catch (error) {
    console.error("[ACTION] Error fetching completion data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch data",
      data: [],
    };
  }
}

/**
 * Server action to fetch filtered holidays data
 */
export async function getHolidaysData(
  userId: string,
  filterType: FilterType,
  year?: number,
) {
  try {
    const data = await getFilteredHolidaysData(userId, filterType, year);
    return { success: true, data };
  } catch (error) {
    console.error("[ACTION] Error fetching holidays data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch data",
      data: [],
    };
  }
}

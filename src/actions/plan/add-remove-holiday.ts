"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "../auth";

interface AddHolidayInput {
  date: string; // ISO date string (YYYY-MM-DD)
  reason?: string;
}

interface RemoveHolidayInput {
  date: string; // ISO date string (YYYY-MM-DD)
}

interface Response<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Add a date as a holiday for the current user
 */
export async function addHoliday(input: AddHolidayInput): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    const holidayDate = new Date(input.date);

    // Check if holiday already exists
    const existingHoliday = await prisma.holiday.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: holidayDate,
        },
      },
    });

    if (existingHoliday) {
      return {
        success: false,
        message: "This date is already marked as a holiday",
      };
    }

    // Create the holiday
    const holiday = await prisma.holiday.create({
      data: {
        userId: user.id,
        date: holidayDate,
        reason: input.reason || null,
      },
    });

    return {
      success: true,
      message: "Holiday marked successfully",
      data: holiday,
    };
  } catch (error) {
    console.error("Error adding holiday:", error);
    return {
      success: false,
      message: "Failed to mark holiday. Please try again.",
    };
  }
}

/**
 * Remove a date from holidays for the current user
 */
export async function removeHoliday(
  input: RemoveHolidayInput,
): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const userId = user.id;
    const holidayDate = new Date(input.date);

    // Delete the holiday
    const deleted = await prisma.holiday.delete({
      where: {
        userId_date: {
          userId,
          date: holidayDate,
        },
      },
    });

    return {
      success: true,
      message: "Holiday removed successfully",
      data: deleted,
    };
  } catch (error) {
    console.error("Error removing holiday:", error);
    return {
      success: false,
      message: "Failed to remove holiday. Please try again.",
    };
  }
}

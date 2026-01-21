"use server";

import { getCurrentUser } from "@/actions/auth";
import { prisma } from "@/lib/db";

interface UpdateProfileInput {
  name: string;
  age: number;
  goals: string;
  timeAvailability: number;
  activities: string;
  energeticTime: string;
  daysOff: string[];
  additionalNotes: string;
}

interface UpdateProfileResult {
  success: boolean;
  message: string;
}

/**
 * Update user profile and onboarding data
 */
export async function updateUserProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // Validation: Name should contain only characters
    if (!/^[a-zA-Z\s'-]+$/.test(input.name)) {
      return {
        success: false,
        message:
          "Name should contain only letters, spaces, hyphens, and apostrophes",
      };
    }

    // Validation: Age should be a number between 1 and 120
    if (isNaN(input.age) || input.age < 1 || input.age > 120) {
      return {
        success: false,
        message: "Age must be a valid number between 1 and 120",
      };
    }

    // Validation: Time availability should be a positive number
    if (isNaN(input.timeAvailability) || input.timeAvailability <= 0) {
      return {
        success: false,
        message: "Time availability must be a positive number",
      };
    }

    // Validation: Energetic time range - should be 30 min to 4 hours
    const timeRegex = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;
    const timeMatch = input.energeticTime.match(timeRegex);

    if (!timeMatch) {
      return {
        success: false,
        message:
          "Invalid time format. Use HH:MM-HH:MM format (e.g., 06:00-10:00)",
      };
    }

    const fromHour = parseInt(timeMatch[1], 10);
    const fromMin = parseInt(timeMatch[2], 10);
    const toHour = parseInt(timeMatch[3], 10);
    const toMin = parseInt(timeMatch[4], 10);

    // Validate time components
    if (
      fromHour < 0 ||
      fromHour > 23 ||
      fromMin < 0 ||
      fromMin > 59 ||
      toHour < 0 ||
      toHour > 23 ||
      toMin < 0 ||
      toMin > 59
    ) {
      return {
        success: false,
        message:
          "Invalid time values. Hours must be 0-23, minutes must be 0-59",
      };
    }

    // Calculate duration in minutes
    const fromTotalMin = fromHour * 60 + fromMin;
    const toTotalMin = toHour * 60 + toMin;

    let durationMin = toTotalMin - fromTotalMin;
    if (durationMin <= 0) {
      durationMin += 24 * 60; // Handle next day scenario
    }

    // Check if duration is between 30 minutes and 4 hours
    if (durationMin < 30 || durationMin > 4 * 60) {
      return {
        success: false,
        message: "Time range duration must be between 30 minutes and 4 hours",
      };
    }

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
      },
    });

    // Update or create onboarding
    await prisma.onboarding.upsert({
      where: { userId: user.id },
      update: {
        age: input.age,
        goals: input.goals,
        timeAvailability: input.timeAvailability,
        activities: input.activities,
        energeticTime: input.energeticTime,
        daysOff: input.daysOff,
        additionalNotes: input.additionalNotes,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        age: input.age,
        goals: input.goals,
        goalSpecificInfo: {},
        timeAvailability: input.timeAvailability,
        activities: input.activities,
        energeticTime: input.energeticTime,
        daysOff: input.daysOff,
        additionalNotes: input.additionalNotes,
        termsAccepted: true,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}

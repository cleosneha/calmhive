"use server";

import { getCurrentUser } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ToggleEmailResult {
  success: boolean;
  message: string;
}

/**
 * Toggle weekly insights email preference
 */
export async function toggleWeeklyEmailPreference(
  receiveEmails: boolean,
): Promise<ToggleEmailResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // Update the stopEmail field (inverse of receiveEmails)
    await prisma.user.update({
      where: { id: user.id },
      data: { stopEmail: !receiveEmails },
    });

    revalidatePath("/user/settings");

    return {
      success: true,
      message: receiveEmails
        ? "Weekly insights emails enabled"
        : "Weekly insights emails disabled",
    };
  } catch (error) {
    console.error("[TOGGLE_EMAIL] Error:", error);
    return {
      success: false,
      message: "Failed to update email preference",
    };
  }
}

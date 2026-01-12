"use server";

import { getCurrentUser } from "@/actions/auth";
import prisma from "@/lib/db";

export interface AICountCheckResult {
  success: boolean;
  canUse: boolean;
  currentCount: number;
  limit: number;
  message?: string;
}

export interface AICountIncrementResult extends AICountCheckResult {
  newCount?: number;
}

const AI_GENERATION_LIMIT = 3;
const RESET_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check current AI note generation count and reset if 24 hours have passed.
 * Returns the current count and whether user can generate more notes.
 */
export async function checkAIGenerationCount(): Promise<AICountCheckResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return {
        success: false,
        canUse: false,
        currentCount: 0,
        limit: AI_GENERATION_LIMIT,
        message: "Unauthorized",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        aiNoteGenerationCount: true,
        aiNoteGenerationCountResetAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        canUse: false,
        currentCount: 0,
        limit: AI_GENERATION_LIMIT,
        message: "User not found",
      };
    }

    let currentCount = user.aiNoteGenerationCount;
    let resetAt = user.aiNoteGenerationCountResetAt;

    // Check if 24 hours have passed since reset
    if (resetAt) {
      const now = new Date();
      const timePassed = now.getTime() - resetAt.getTime();

      if (timePassed >= RESET_PERIOD_MS) {
        // 24 hours have passed, reset the count
        currentCount = 0;
        resetAt = null;
      }
    }

    const canUse = currentCount < AI_GENERATION_LIMIT;

    return {
      success: true,
      canUse,
      currentCount,
      limit: AI_GENERATION_LIMIT,
    };
  } catch (error) {
    console.error("Error checking AI generation count:", error);
    return {
      success: false,
      canUse: false,
      currentCount: 0,
      limit: AI_GENERATION_LIMIT,
      message: "Failed to check AI generation limit",
    };
  }
}

/**
 * Increment AI note generation count and set reset timestamp if first use.
 */
export async function incrementAIGenerationCount(): Promise<AICountIncrementResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return {
        success: false,
        canUse: false,
        currentCount: 0,
        limit: AI_GENERATION_LIMIT,
        message: "Unauthorized",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        aiNoteGenerationCount: true,
        aiNoteGenerationCountResetAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        canUse: false,
        currentCount: 0,
        limit: AI_GENERATION_LIMIT,
        message: "User not found",
      };
    }

    let currentCount = user.aiNoteGenerationCount;
    let resetAt = user.aiNoteGenerationCountResetAt;

    // Check if 24 hours have passed since reset
    if (resetAt) {
      const now = new Date();
      const timePassed = now.getTime() - resetAt.getTime();

      if (timePassed >= RESET_PERIOD_MS) {
        // 24 hours have passed, reset the count
        currentCount = 0;
        resetAt = null;
      }
    }

    // Check if user can still use AI
    if (currentCount >= AI_GENERATION_LIMIT) {
      return {
        success: true,
        canUse: false,
        currentCount,
        limit: AI_GENERATION_LIMIT,
        message: "AI generation limit reached (3/24h)",
      };
    }

    // Increment count and set reset time if first use
    const newCount = currentCount + 1;
    const newResetAt = resetAt || new Date(); // Set timestamp on first use only

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        aiNoteGenerationCount: newCount,
        aiNoteGenerationCountResetAt: newResetAt,
      },
      select: {
        aiNoteGenerationCount: true,
      },
    });

    return {
      success: true,
      canUse: true,
      currentCount: updatedUser.aiNoteGenerationCount,
      newCount: updatedUser.aiNoteGenerationCount,
      limit: AI_GENERATION_LIMIT,
    };
  } catch (error) {
    console.error("Error incrementing AI generation count:", error);
    return {
      success: false,
      canUse: false,
      currentCount: 0,
      limit: AI_GENERATION_LIMIT,
      message: "Failed to increment AI generation count",
    };
  }
}

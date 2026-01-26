"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "../auth";

export async function updateRecentlyVisited(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Get current list
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { recentlyVisitedJournalEntries: true },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    let list = currentUser.recentlyVisitedJournalEntries || [];

    // Remove if already exists
    list = list.filter((id) => id !== entryId);

    // Add to front
    list.unshift(entryId);

    // Keep only first 6
    if (list.length > 6) {
      list = list.slice(0, 6);
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { recentlyVisitedJournalEntries: list },
    });

    return { success: true, message: "Updated recently visited" };
  } catch (error) {
    console.error("Error updating recently visited:", error);
    return { success: false, message: "Failed to update recently visited" };
  }
}

export async function removeFromRecentlyVisited(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "User not authenticated" };
    }

    // Get current list
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { recentlyVisitedJournalEntries: true },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    let list = currentUser.recentlyVisitedJournalEntries || [];

    // Remove the entry if it exists
    list = list.filter((id) => id !== entryId);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { recentlyVisitedJournalEntries: list },
    });

    return { success: true, message: "Removed from recently visited" };
  } catch (error) {
    console.error("Error removing from recently visited:", error);
    return {
      success: false,
      message: "Failed to remove from recently visited",
    };
  }
}

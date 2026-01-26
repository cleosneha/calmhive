"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function pinEntry(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // First, get the current entry to check ownership and current pin status
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId: user.id,
      },
      select: {
        pinned: true,
      },
    });

    if (!entry) {
      return { success: false, message: "Entry not found" };
    }

    // Toggle the pinned status
    const updatedEntry = await prisma.journalEntry.update({
      where: {
        id: entryId,
        userId: user.id,
      },
      data: {
        pinned: !entry.pinned,
      },
    });

    revalidatePath("/user/journal");

    return {
      success: true,
      message: updatedEntry.pinned
        ? "Entry pinned successfully"
        : "Entry unpinned successfully",
      data: updatedEntry,
    };
  } catch (error) {
    console.error("Error pinning/unpinning entry:", error);
    return { success: false, message: "Failed to update entry pin status" };
  }
}

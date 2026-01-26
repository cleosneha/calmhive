"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function removeJournalEntry(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // First, check if the entry exists and belongs to the user
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!entry) {
      return { success: false, message: "Entry not found or access denied" };
    }

    // Delete the entry
    await prisma.journalEntry.delete({
      where: {
        id: entryId,
        userId: user.id,
      },
    });

    revalidatePath("/user/journal");

    return {
      success: true,
      message: "Entry deleted successfully",
      data: { deletedEntryId: entryId, title: entry.title },
    };
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return { success: false, message: "Failed to delete entry" };
  }
}

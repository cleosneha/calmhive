"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";

export async function getLockedEntries() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized", data: null };
    }

    // Fetch locked (private) entries
    const lockedEntries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
        isPrivate: true,
      },
      select: {
        id: true,
        title: true,
        date: true,
        finalContent: true,
        mood: true,
        pinned: true,
        isPrivate: true,
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });

    const formattedEntries = lockedEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      date: entry.date,
      excerpt:
        entry.finalContent.slice(0, 50) +
        (entry.finalContent.length > 50 ? "..." : ""),
      mood: entry.mood?.toString(),
      pinned: entry.pinned,
    }));

    return {
      success: true,
      message: "Locked entries fetched successfully",
      data: {
        entries: formattedEntries,
        userImage: user.image ?? undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching locked entries:", error);
    return {
      success: false,
      message: "Failed to fetch locked entries",
      data: null,
    };
  }
}

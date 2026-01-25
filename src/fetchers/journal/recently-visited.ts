import { prisma } from "@/lib/db"; // Assuming Prisma client is set up

export async function getJournalHomeData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recentlyVisitedJournalEntries: true },
    });

    let recentEntries: { id: number; title: string; date: Date }[] = [];
    if (user?.recentlyVisitedJournalEntries?.length) {
      // fetch only non-private entries and minimal fields
      const entries = await prisma.journalEntry.findMany({
        where: {
          id: { in: user.recentlyVisitedJournalEntries },
          userId,
          isPrivate: false,
        },
        select: {
          id: true,
          title: true,
          date: true,
        },
      });

      // Preserve the order from user's recentlyVisitedJournalEntries array
      const entriesById = new Map(entries.map((e) => [e.id, e]));

      recentEntries = user.recentlyVisitedJournalEntries
        .filter((id) => entriesById.has(id))
        .slice(0, 6)
        .map((id) => {
          const e = entriesById.get(id)!;
          return { id: e.id, title: e.title, date: e.date };
        });
    }

    // Fetch pinned entries
    const pinnedDbEntries = await prisma.journalEntry.findMany({
      where: { userId, pinned: true },
      select: {
        id: true,
        title: true,
        date: true,
        finalContent: true,
        mood: true,
        pinned: true,
        isPrivate: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    const pinnedEntries = pinnedDbEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      date: entry.date,
      excerpt:
        entry.finalContent.slice(0, 50) +
        (entry.finalContent.length > 50 ? "..." : ""),
      mood: entry.mood?.toString(),
      pinned: entry.pinned,
      isPrivate: entry.isPrivate,
    }));

    return {
      success: true,
      message: "Fetched successfully",
      data: { recent: recentEntries, pinned: pinnedEntries },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch entries",
      data: { recent: [], pinned: [] },
    };
  }
}

export async function getRecentlyVisitedJournalEntries(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recentlyVisitedJournalEntries: true },
    });

    if (!user || !user.recentlyVisitedJournalEntries.length) {
      return { success: true, message: "No recent entries", data: [] };
    }

    // Fetch only non-private entries and minimal fields
    const entries = await prisma.journalEntry.findMany({
      where: {
        id: { in: user.recentlyVisitedJournalEntries },
        userId,
        isPrivate: false,
      },
      select: {
        id: true,
        title: true,
        date: true,
      },
    });

    const entriesById = new Map(entries.map((e) => [e.id, e]));

    const mappedEntries = user.recentlyVisitedJournalEntries
      .filter((id) => entriesById.has(id))
      .slice(0, 6)
      .map((id) => {
        const e = entriesById.get(id)!;
        return { id: e.id, title: e.title, date: e.date };
      });

    return {
      success: true,
      message: "Fetched successfully",
      data: mappedEntries,
    };
  } catch (error) {
    return { success: false, message: "Failed to fetch entries", data: [] };
  }
}

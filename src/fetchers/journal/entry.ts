import { prisma } from "@/lib/db";
import type { Mood } from "@/types/journal";

export interface JournalEntryData {
  id: number;
  title: string;
  content: string;
  mood?: Mood;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface GetJournalEntryResponse {
  success: boolean;
  message?: string;
  data: JournalEntryData | null;
}

export async function getJournalEntry(
  entryId: string,
  userId: string,
): Promise<GetJournalEntryResponse> {
  try {
    const id = parseInt(entryId);
    if (isNaN(id)) {
      return { success: false, message: "Invalid entry ID", data: null };
    }
    console.log("Fetching journal entry", { id, userId });

    const entry = await prisma.journalEntry.findUnique({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        finalContent: true,
        mood: true,
        pinned: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("Fetching journal entry", { id, userId });
    console.log("Entry found:", entry);

    console.log("Fetched journal entry", entry);

    if (!entry) {
      return { success: false, message: "Entry not found", data: null };
    }

    return {
      success: true,
      data: {
        id: entry.id,
        title: entry.title,
        content: entry.finalContent,
        mood: entry.mood ?? undefined,
        pinned: entry.pinned,
        isPrivate: entry.isPrivate,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt ?? undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return { success: false, message: "Failed to fetch entry", data: null };
  }
}

"use server";

import { prisma } from "@/lib/db";
import type { Mood } from "@/types/journal";
import { getCurrentUser } from "@/actions/auth";

interface JournalEntryWhere {
  userId: string;
  isPrivate?: boolean;
  title?: {
    contains: string;
    mode: "insensitive" | "default";
  };
  mood?: Mood;
}

interface JournalEntryOrderByItem {
  pinned?: "asc" | "desc";
  createdAt?: "asc" | "desc";
}

export interface JournalEntryListItem {
  id: number;
  title: string;
  mood?: Mood;
  pinned: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface GetJournalEntriesResponse {
  success: boolean;
  message?: string;
  data: {
    entries: JournalEntryListItem[];
    hasMore: boolean;
    total: number;
  } | null;
}

interface GetJournalEntriesParams {
  limit: number;
  offset: number;
  query?: string;
  sortBy?: "latest" | "oldest";
  mood?: Mood | null;
}

export async function getJournalEntries({
  limit,
  offset,
  query,
  sortBy = "latest",
  mood,
}: GetJournalEntriesParams): Promise<GetJournalEntriesResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Not authenticated", data: null };
    }

    // Build where clause
    const where: JournalEntryWhere = {
      userId: user.id,
      isPrivate: false,
    };

    if (query && query.trim()) {
      where.title = {
        contains: query.trim(),
        mode: "insensitive",
      };
    }

    if (mood) {
      where.mood = mood;
    }

    // Get total count for hasMore calculation
    const total = await prisma.journalEntry.count({ where });

    // Build orderBy
    const orderBy: JournalEntryOrderByItem[] = [
      { pinned: "desc" }, // Pinned first
      { createdAt: sortBy === "latest" ? "desc" : "asc" },
    ];

    const entries = await prisma.journalEntry.findMany({
      where,
      select: {
        id: true,
        title: true,
        mood: true,
        pinned: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    const hasMore = offset + entries.length < total;

    return {
      success: true,
      data: {
        entries: entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          mood: entry.mood ?? undefined,
          pinned: entry.pinned,
          isPrivate: entry.isPrivate,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt ?? undefined,
        })),
        hasMore,
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return { success: false, message: "Failed to fetch entries", data: null };
  }
}

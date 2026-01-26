"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import type { Mood } from "@/types/journal";

export async function addJournalEntry(data: {
  title: string;
  content: string;
  mood?: string;
  pinned: boolean;
  isPrivate: boolean;
}) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: data.title,
        finalContent: data.content,
        mood: data.mood as Mood,
        pinned: data.pinned,
        isPrivate: data.isPrivate,
        date: new Date(),
      },
    });

    revalidatePath("/user/journal");

    return { success: true, data: entry };
  } catch (error) {
    return { success: false, message: "Failed to create entry" };
  }
}

"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// Mark a journal entry as private (locked)
export async function markEntryPrivate(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if entry exists and belongs to user
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId: user.id,
      },
      select: {
        id: true,
        isPrivate: true,
      },
    });

    if (!entry) {
      return { success: false, message: "Entry not found" };
    }

    // Toggle private status
    const updatedEntry = await prisma.journalEntry.update({
      where: {
        id: entryId,
        userId: user.id,
      },
      data: {
        isPrivate: !entry.isPrivate,
      },
    });

    revalidatePath("/user/journal");

    return {
      success: true,
      message: updatedEntry.isPrivate
        ? "Entry locked successfully"
        : "Entry unlocked successfully",
      data: updatedEntry,
    };
  } catch (error) {
    console.error("Error toggling entry privacy:", error);
    return { success: false, message: "Failed to update entry privacy" };
  }
}

// Verify security PIN
export async function verifySecurityPin(pin: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get user's encrypted PIN
    const userWithPin = await prisma.user.findUnique({
      where: { id: user.id },
      select: { encryptedPin: true },
    });

    if (!userWithPin?.encryptedPin) {
      return { success: false, message: "No security PIN set" };
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, userWithPin.encryptedPin);

    if (!isValid) {
      return { success: false, message: "Invalid PIN" };
    }

    return { success: true, message: "PIN verified successfully" };
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return { success: false, message: "Failed to verify PIN" };
  }
}

// Remove entry from locked chat (make it public)
export async function unlockEntry(entryId: number) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if entry exists, belongs to user, and is private
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId: user.id,
        isPrivate: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!entry) {
      return { success: false, message: "Entry not found or not locked" };
    }

    // Make entry public
    const updatedEntry = await prisma.journalEntry.update({
      where: {
        id: entryId,
        userId: user.id,
      },
      data: {
        isPrivate: false,
      },
    });

    revalidatePath("/user/journal");

    return {
      success: true,
      message: "Entry unlocked successfully",
      data: updatedEntry,
    };
  } catch (error) {
    console.error("Error unlocking entry:", error);
    return { success: false, message: "Failed to unlock entry" };
  }
}

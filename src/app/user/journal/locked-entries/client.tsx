"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiTrash, FiMoreVertical, FiUnlock } from "react-icons/fi";
import { TiPin } from "react-icons/ti";
import { unlockEntry } from "@/actions/journal/secure-entry";
import { removeJournalEntry } from "@/actions/journal/remove-journal-entry";
import { toast } from "sonner";
import { stripHtml } from "@/utils/formatting";

interface LockedEntry {
  id: number;
  title: string;
  date: Date;
  excerpt?: string;
  mood?: string;
  pinned?: boolean;
}

interface LockedChatsProps {
  entries: LockedEntry[];
}

export default function LockedChats({ entries }: LockedChatsProps) {
  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const handleEntryClick = (entryId: number) => {
    router.push(`/user/journal/entry-section/${entryId}?mode=show`);
  };

  const handleUnlock = async (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        "Are you sure you want to unlock this entry? It will become visible to others.",
      )
    ) {
      try {
        const result = await unlockEntry(entryId);
        if (result.success) {
          toast.success("Entry unlocked successfully");
          window.location.reload();
        } else {
          toast.error(result.message || "Failed to unlock entry");
        }
      } catch {
        toast.error("Failed to unlock entry");
      }
    }
  };

  const handleDelete = async (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this entry?")) {
      try {
        const result = await removeJournalEntry(entryId);
        if (result.success) {
          toast.success("Entry deleted successfully");
          window.location.reload();
        } else {
          toast.error(result.message || "Failed to delete entry");
        }
      } catch {
        toast.error("Failed to delete entry");
      }
    }
  };

  const renderListItem = (entry: LockedEntry) => (
    <div
      key={entry.id}
      className="p-4 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
      onClick={() => handleEntryClick(entry.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {entry.pinned && (
            <TiPin className="text-[var(--ch-sage-dark)] flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{entry.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--ch-muted)]">
                {entry.date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            {entry.excerpt && (
              <p className="text-xs text-[var(--ch-slate)] mt-1">
                {truncateText(stripHtml(entry.excerpt))}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-[var(--ch-slate-dark)]/10"
              onClick={(e) => e.stopPropagation()}
            >
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleUnlock(entry.id, e)}>
              <FiUnlock className="mr-2 h-4 w-4" />
              Unlock Entry
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleDelete(entry.id, e)}
              className="text-red-600 focus:text-red-600"
            >
              <FiTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ch-slate-dark)]">
          Locked Entries
        </h1>
        <p className="mt-2 text-sm text-[var(--ch-slate)] italic">
          Your private and secure journal entries
        </p>
      </header>

      <div className="flex items-start gap-6">
        <main className="flex-1">
          <div className="space-y-0">
            {entries.length > 0 ? (
              entries.map((entry) => renderListItem(entry))
            ) : (
              <div className="p-8 text-center">
                <div className="text-sm text-[var(--ch-slate)]">
                  You don&apos;t have any locked entries yet
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

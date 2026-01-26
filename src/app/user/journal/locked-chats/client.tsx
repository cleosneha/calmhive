"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { FiFileText, FiTrash, FiMoreVertical, FiUnlock } from "react-icons/fi";
import { unlockEntry } from "@/actions/journal/secure-entry";
import { removeJournalEntry } from "@/actions/journal/remove-journal-entry";
import { toast } from "sonner";

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
  userImage?: string;
}

export default function LockedChats({ entries, userImage }: LockedChatsProps) {
  const router = useRouter();

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

  const renderCard = (entry: LockedEntry) => (
    <Card
      key={entry.id}
      className="aspect-square min-w-[220px] p-0 overflow-hidden cursor-pointer shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-3xl"
      onClick={() => handleEntryClick(entry.id)}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 bg-[var(--ch-slate-dark)]/6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[var(--ch-slate-dark)]/10 flex items-center justify-center text-[var(--ch-slate)]">
              <FiFileText />
            </div>
            <h4 className="font-semibold text-[var(--ch-slate-dark)] truncate">
              {entry.title}
            </h4>
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

        <div className="flex-1 p-3">
          {entry.excerpt ? (
            <p className="text-xs text-[var(--ch-slate)]">{entry.excerpt}</p>
          ) : null}
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userImage ? (
              <Image
                src={userImage}
                alt="user"
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--ch-slate-dark)]/10" />
            )}
          </div>
          <div className="text-xs text-[var(--ch-slate)]">
            {entry.date.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            })}
          </div>
        </div>
      </div>
    </Card>
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
          <div className="flex gap-4 overflow-x-auto pb-3">
            {entries.length > 0 ? (
              entries.map((entry) => renderCard(entry))
            ) : (
              <Card className="aspect-square min-w-[220px] p-0 overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-3xl">
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-3 p-3 bg-[var(--ch-slate-dark)]/6">
                    <div className="w-8 h-8 rounded-md bg-[var(--ch-slate-dark)]/10 flex items-center justify-center text-[var(--ch-slate)]">
                      <FiFileText />
                    </div>
                    <h4 className="font-semibold text-[var(--ch-slate-dark)] truncate">
                      No Locked Entries
                    </h4>
                  </div>

                  <div className="flex-1 p-3 flex items-center justify-center">
                    <p className="text-sm text-[var(--ch-slate)]">
                      You don&apos;t have any locked entries yet
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

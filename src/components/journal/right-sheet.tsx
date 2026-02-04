"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FiSearch,
  FiLock,
  FiEdit,
  FiTrash,
  FiMoreVertical,
} from "react-icons/fi";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { BsPin } from "react-icons/bs";
import { TiPin } from "react-icons/ti";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getMoodIcon } from "@/utils/mood-icons";
import type { Mood } from "@/types/journal";
import { useJournalEntries } from "@/hooks/use-journal-entries";
import { useJournalHome } from "@/hooks/use-journal-home";
import { SecurityPinDialog } from "@/components/journal/security-pin-dialog";

const MOODS: Mood[] = [
  "HAPPY",
  "SAD",
  "ANGRY",
  "CALM",
  "EXCITED",
  "ANXIOUS",
  "NEUTRAL",
];

export default function RightSheet() {
  const {
    query,
    sortBy,
    mood,
    entries,
    loading,
    hasMore,
    lastEntryRef,
    setQuery,
    setSortBy,
    setMood,
    handleEntryClick,
  } = useJournalEntries();

  const { handleEdit, handlePin, handleDelete, handleMarkPrivate } =
    useJournalHome();

  const [isLockedDialogOpen, setIsLockedDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleEntryClickWithClose = (entryId: number) => {
    setIsSheetOpen(false);
    handleEntryClick(entryId);
  };

  const handleEditWithClose = (entryId: number, e: React.MouseEvent) => {
    setIsSheetOpen(false);
    handleEdit(entryId, e);
  };

  const handlePinSuccess = () => {
    // Store verification in localStorage with 30-minute expiration
    const verificationData = {
      verified: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    };
    localStorage.setItem(
      "lockedEntriesVerified",
      JSON.stringify(verificationData),
    );

    // Navigate to locked chats section
    window.location.href = "/user/journal/locked-chats";
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {/* Thin handle column */}
      <SheetTrigger asChild>
        <Button
          aria-label="Open right sheet"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-8 h-16 rounded-br-none rounded-tr-none bg-white border-l border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 focus:outline-none"
        >
          <MdKeyboardDoubleArrowLeft className="text-[var(--ch-sage-dark)]" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="max-w-md flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Entries</SheetTitle>
              <SheetDescription>
                Search, sort and filter your journal entries
              </SheetDescription>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-4">
            <label className="sr-only">Search by title</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ch-slate)] opacity-60" />
              <Input
                placeholder="Search by title..."
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="mt-3 flex flex-col gap-3 items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--ch-slate)]">Sort By</span>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as "latest" | "oldest")}
                >
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-[var(--ch-slate)]">Mood</span>

                <Select
                  value={mood || "all"}
                  onValueChange={(v) =>
                    setMood(v === "all" ? null : (v as Mood))
                  }
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any mood</SelectItem>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          {React.createElement(getMoodIcon(m).icon, {
                            className: `${getMoodIcon(m).color} text-lg`,
                          })}
                          {m.charAt(0) + m.slice(1).toLowerCase()}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Locked Entries Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
                onClick={() => setIsLockedDialogOpen(true)}
              >
                <FiLock className="text-sm" />
                Locked Entries
              </Button>

              <SecurityPinDialog
                isOpen={isLockedDialogOpen}
                onClose={() => setIsLockedDialogOpen(false)}
                onSuccess={handlePinSuccess}
                title="Access Locked Entries"
                description="Enter your security PIN to access locked journal entries."
              />
            </div>
          </div>
        </SheetHeader>

        {/* Entries List - Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const isLastEntry = index === entries.length - 1;
              return (
                <div
                  key={entry.id}
                  ref={isLastEntry && hasMore ? lastEntryRef : undefined}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--ch-taupe)] cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => handleEntryClickWithClose(entry.id)}
                  >
                    {entry.pinned && (
                      <BsPin className="text-[var(--ch-sage-dark)] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {entry.mood && (
                          <div className="text-xs">
                            {React.createElement(getMoodIcon(entry.mood).icon, {
                              className: `${getMoodIcon(entry.mood).color} text-sm`,
                            })}
                          </div>
                        )}
                        <span className="text-xs text-[var(--ch-muted)]">
                          {entry.date.toLocaleDateString("en-US")}
                        </span>
                        {entry.isPrivate && (
                          <span className="text-xs text-[var(--ch-muted)]">
                            Private
                          </span>
                        )}
                      </div>
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
                      <DropdownMenuItem
                        onClick={(e) => handleEditWithClose(entry.id, e)}
                      >
                        <FiEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handlePin(entry.id, e)}
                        disabled={entry.isPrivate}
                      >
                        <TiPin className="mr-2 h-4 w-4" />
                        {entry.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleMarkPrivate(entry.id, e)}
                        disabled={entry.pinned}
                      >
                        <FiLock className="mr-2 h-4 w-4" />
                        {entry.isPrivate ? "Make Public" : "Mark as Private"}
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
              );
            })}

            {/* Loading indicator */}
            {loading && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">Loading...</div>
              </div>
            )}

            {/* No more entries message */}
            {!hasMore && entries.length > 0 && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">
                  No more entries
                </div>
              </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && !loading && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">
                  No entries found
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

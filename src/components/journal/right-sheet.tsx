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
import { FiSearch, FiLock } from "react-icons/fi";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { BsPin } from "react-icons/bs";

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
    observerRef,
    setQuery,
    setSortBy,
    setMood,
    handleEntryClick,
  } = useJournalEntries();

  const [isLockedDialogOpen, setIsLockedDialogOpen] = useState(false);

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
    <Sheet>
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

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry.id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--ch-taupe)] cursor-pointer transition-colors"
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
                      {entry.createdAt.toLocaleDateString("en-US")}
                    </span>
                    {entry.isPrivate && (
                      <span className="text-xs text-[var(--ch-muted)]">
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">Loading...</div>
              </div>
            )}
            {!hasMore && entries.length > 0 && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">
                  No more entries
                </div>
              </div>
            )}
            {entries.length === 0 && !loading && (
              <div className="text-center py-4">
                <div className="text-sm text-[var(--ch-muted)]">
                  No entries found
                </div>
              </div>
            )}
          </div>
          <div ref={observerRef} className="h-4" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

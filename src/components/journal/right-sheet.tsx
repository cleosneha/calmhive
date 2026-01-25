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
import { FiSearch } from "react-icons/fi";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const MOODS = [
  "HAPPY",
  "SAD",
  "ANGRY",
  "CALM",
  "EXCITED",
  "ANXIOUS",
  "NEUTRAL",
];

export default function RightSheet() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [mood, setMood] = useState<string | null>(null);

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

      <SheetContent side="right" className="max-w-md">
        <SheetHeader className="p-6">
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
                  onValueChange={(v) => setMood(v === "all" ? null : v)}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any mood</SelectItem>
                    {MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.charAt(0) + m.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

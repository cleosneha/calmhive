"use client";

import React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FiChevronLeft } from "react-icons/fi";

export default function RightSheet() {
  return (
    <Sheet>
      {/* Thin handle column */}
      <SheetTrigger asChild>
        <button
          aria-label="Open right sheet"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-8 h-16 rounded-l-md bg-white border-l border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 focus:outline-none"
        >
          <FiChevronLeft className="text-[var(--ch-sage-dark)]" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="max-w-md">
        <SheetHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Entry Details</SheetTitle>
              <SheetDescription>
                View and manage selected journal entry
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Close</span>✕
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="p-6">
          <p className="text-sm text-[var(--ch-slate)]">
            Select an entry to view details here. This sheet can hold entry
            meta, actions, and deeper insights.
          </p>

          <div className="mt-6 flex gap-2">
            <Button variant="outline">Edit</Button>
            <Button variant="ghost">Pin</Button>
            <Button variant="ghost">Share</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

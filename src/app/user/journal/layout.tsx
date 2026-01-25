import React from "react";
import RightSheet from "@/components/journal/right-sheet";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex ">
      <main className="flex-1 p-8">{children}</main>

      {/* Right sheet handle and content */}
      <RightSheet />
    </div>
  );
}

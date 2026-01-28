"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EntryView from "@/components/journal/entry-view";
import EntryForm from "@/components/journal/entry-form";
import { JournalEntryData } from "@/fetchers/journal/entry";
import { toast } from "sonner";

type Entry = JournalEntryData;

interface EntrySectionProps {
  entryId: string;
  mode: "new" | "show" | "edit";
  userId: string;
  initialEntry: Entry | null;
}

export default function EntrySection({
  entryId,
  mode,
  userId,
  initialEntry,
}: EntrySectionProps) {
  const [entry, setEntry] = useState<Entry | null>(initialEntry);
  const router = useRouter();

  console.log(
    "EntrySection userId:",
    userId,
    "entryId:",
    entryId,
    "mode:",
    mode,
  );

  const handleEdit = () => {
    router.push(`/user/journal/entry-section/${entryId}?mode=edit`);
  };

  const handleSave = async (data: {
    title: string;
    content: string;
    mood?: string;
    pinned: boolean;
    isPrivate: boolean;
  }) => {
    let result;
    if (mode === "new") {
      const { addJournalEntry } =
        await import("@/actions/journal/add-journal-entry");
      result = await addJournalEntry(data);
      if (result.success) {
        router.push(
          `/user/journal/entry-section/${result?.data?.id}?mode=show`,
        );
      }
    } else if (mode === "edit") {
      const { editJournalEntry } =
        await import("@/actions/journal/edit-journal-entry");
      result = await editJournalEntry(entryId, data);
      if (result.success) {
        router.push(`/user/journal/entry-section/${entryId}?mode=show`);
        router.refresh();
      }
    }
    if (!result?.success) {
      toast.error(result?.message || "Failed to save");
    }
  };

  if (mode === "new") {
    return <EntryForm mode="new" onSave={handleSave} />;
  }

  if (!entry) return <div>Entry not found</div>;

  if (mode === "show") {
    return <EntryView entry={entry} onEdit={handleEdit} />;
  }

  if (mode === "edit") {
    return <EntryForm entry={entry} mode="edit" onSave={handleSave} />;
  }

  return null;
}

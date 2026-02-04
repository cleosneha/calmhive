"use client";

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
import {
  FiPlus,
  FiFileText,
  FiEdit,
  FiTrash,
  FiMoreVertical,
  FiLock,
} from "react-icons/fi";
import { TiPin } from "react-icons/ti";
import { TbClockFilled } from "react-icons/tb";
import { useJournalHome } from "@/hooks/use-journal-home";
import { stripHtml } from "@/utils/formatting";

type Entry = {
  id: number;
  title: string;
  date: Date;
  excerpt?: string;
  mood?: string;
  pinned?: boolean;
  isPrivate?: boolean;
};

interface JournalHomeMobileProps {
  recentEntries: Entry[];
  pinnedEntries: Entry[];
  userImage?: string;
  message: string;
  quote: string;
}

export default function JournalHomeMobile({
  recentEntries,
  pinnedEntries,
  userImage,
  message,
  quote,
}: JournalHomeMobileProps) {
  const router = useRouter();

  const { handleEdit, handlePin, handleDelete, handleMarkPrivate } =
    useJournalHome();

  const renderListItem = (entry: Entry) => (
    <Card
      key={entry.id}
      className="p-4 cursor-pointer hover:bg-[var(--ch-taupe)] transition-colors border-b border-slate-100 last:border-b-0"
      onClick={() =>
        router.push(`/user/journal/entry-section/${entry.id}?mode=show`)
      }
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
                {entry.date.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              {entry.isPrivate && (
                <span className="text-xs text-[var(--ch-muted)]">Private</span>
              )}
            </div>
            {entry.excerpt && (
              <p className="text-xs text-[var(--ch-slate)] mt-1 line-clamp-2">
                {stripHtml(entry.excerpt)}
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
            <DropdownMenuItem onClick={(e) => handleEdit(entry.id, e)}>
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
    </Card>
  );

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ch-slate-dark)]">
          {message}
        </h1>
        <p className="mt-2 text-sm text-[var(--ch-slate)] italic">
          <q>{quote}</q>
        </p>
      </header>

      {/* New Entry Button */}
      <div className="mb-6">
        <Button
          className="w-full h-12 bg-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/90 text-white"
          onClick={() => router.push("/user/journal/entry-section/new")}
        >
          <FiPlus className="mr-2 h-5 w-5" />
          New Entry
        </Button>
      </div>

      {/* Pinned Entries */}
      {pinnedEntries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)] mb-3 flex items-center gap-2">
            <TiPin className="text-[var(--ch-slate)]" />
            Pinned Entries
          </h3>
          <div className="space-y-2">
            {pinnedEntries.map((entry) => renderListItem(entry))}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)] mb-3 flex items-center gap-2">
          <TbClockFilled className="text-[var(--ch-slate)]" />
          Recent Entries
        </h3>
        <div className="space-y-2">
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => renderListItem(entry))
          ) : (
            <Card className="p-4 text-center">
              <p className="text-sm text-[var(--ch-slate)]">
                No recent entries
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

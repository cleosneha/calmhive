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
import { pinEntry } from "@/actions/journal/pin-entry";
import { removeJournalEntry } from "@/actions/journal/remove-journal-entry";
import { markEntryPrivate } from "@/actions/journal/secure-entry";
import { removeFromRecentlyVisited } from "@/actions/journal/update-recently-visited";
import { toast } from "sonner";

type Entry = {
  id: number;
  title: string;
  date: Date; // Changed to Date to match DB
  excerpt?: string; // Optional: short excerpt (recent entries may omit this)
  mood?: string;
  pinned?: boolean;
  isPrivate?: boolean;
};

interface JournalHomeProps {
  recentEntries: Entry[];
  pinnedEntries: Entry[];
  userImage?: string;
  message: string;
  quote: string;
}

export default function JournalHome({
  recentEntries,
  pinnedEntries,
  userImage,
  message,
  quote,
}: JournalHomeProps) {
  const router = useRouter();

  const handleEdit = (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/journal/entry-section/${entryId}?mode=edit`);
  };

  const handlePin = async (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await pinEntry(entryId);
      if (result.success) {
        toast.success("Entry pinned successfully");
        // Optionally refresh the page or update state
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to pin entry");
      }
    } catch {
      toast.error("Failed to pin entry");
    }
  };

  const handleDelete = async (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this entry?")) {
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

  const handleMarkPrivate = async (entryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await markEntryPrivate(entryId);
      if (result.success) {
        toast.success(result.message || "Entry marked as private");
        // Remove from recently visited if present
        await removeFromRecentlyVisitedList(entryId);
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to mark entry as private");
      }
    } catch {
      toast.error("Failed to mark entry as private");
    }
  };

  const removeFromRecentlyVisitedList = async (entryId: number) => {
    try {
      await removeFromRecentlyVisited(entryId);
    } catch (error) {
      console.error("Error removing from recently visited:", error);
    }
  };

  const renderCard = (entry: Entry) => (
    <Card
      key={entry.id}
      className="aspect-square min-w-[220px] p-0 overflow-hidden cursor-pointer  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-3xl"
      onClick={() =>
        router.push(`/user/journal/entry-section/${entry.id}?mode=show`)
      }
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
              <DropdownMenuItem onClick={(e) => handleEdit(entry.id, e)}>
                <FiEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handlePin(entry.id, e)}>
                <TiPin className="mr-2 h-4 w-4" />
                {entry.pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleMarkPrivate(entry.id, e)}>
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
    <div className="min-h-screen ">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ch-slate-dark)]">
          {message}
        </h1>
        <p className="mt-2 text-sm text-[var(--ch-slate)] italic">
          <q>{quote}</q>
        </p>
      </header>
      <div className="flex items-start gap-6">
        {/* Main content */}
        <main className="flex-1">
          <div className="mb-6">
            <div className="flex gap-4 justify-center items-center">
              <Card
                className="aspect-square min-w-[120px] p-0 overflow-hidden rounded-3xl cursor-pointer"
                onClick={() => router.push("/user/journal/entry-section/new")}
              >
                <div className="h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center gap-3 p-3 bg-[var(--ch-slate-dark)]/6">
                    <h4 className="font-semibold text-[var(--ch-slate-dark)] truncate">
                      New Entry
                    </h4>
                    <div className="w-10 h-10 rounded-full bg-[var(--ch-sage-dark)] flex items-center justify-center text-white shadow-md">
                      <FiPlus />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)] mb-3">
              <span className="flex items-center gap-2">
                <TiPin className="text-[var(--ch-slate)]" />
                Pinned Entries
              </span>
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {pinnedEntries.length > 0 ? (
                pinnedEntries.map((entry) => renderCard(entry))
              ) : (
                <Card className="aspect-square min-w-[220px] p-0 overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-3xl">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 p-3 bg-[var(--ch-slate-dark)]/6">
                      <div className="w-8 h-8 rounded-md bg-[var(--ch-slate-dark)]/10 flex items-center justify-center text-[var(--ch-slate)]">
                        <FiFileText />
                      </div>
                      <h4 className="font-semibold text-[var(--ch-slate-dark)] truncate">
                        Pinned
                      </h4>
                    </div>

                    <div className="flex-1 p-3 flex items-center justify-center ">
                      <p className="text-sm text-[var(--ch-slate)]">
                        No entries pinned
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-[var(--ch-slate-dark)] mb-3">
              <span className="flex items-center gap-2">
                <TbClockFilled className="text-[var(--ch-slate)]" />
                Recently visited
              </span>
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => renderCard(entry))
              ) : (
                <Card className="aspect-square min-w-[220px] p-0 overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-3xl">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 p-3 bg-[var(--ch-slate-dark)]/6">
                      <div className="w-8 h-8 rounded-md bg-[var(--ch-slate-dark)]/10 flex items-center justify-center text-[var(--ch-slate)]">
                        <FiFileText />
                      </div>
                      <h4 className="font-semibold text-[var(--ch-slate-dark)] truncate">
                        Recent
                      </h4>
                    </div>

                    <div className="flex-1 p-3 flex items-center justify-center">
                      <p className="text-sm text-[var(--ch-slate)]">
                        No recent entries
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

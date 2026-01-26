import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { pinEntry } from "@/actions/journal/pin-entry";
import { removeJournalEntry } from "@/actions/journal/remove-journal-entry";
import { markEntryPrivate } from "@/actions/journal/secure-entry";
import { removeFromRecentlyVisited } from "@/actions/journal/update-recently-visited";
import { toast } from "sonner";

export function useJournalHome() {
  const router = useRouter();

  const pinnedRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  const [pinnedCanScrollLeft, setPinnedCanScrollLeft] = useState(false);
  const [pinnedCanScrollRight, setPinnedCanScrollRight] = useState(true);
  const [recentCanScrollLeft, setRecentCanScrollLeft] = useState(false);
  const [recentCanScrollRight, setRecentCanScrollRight] = useState(true);

  const cardWidth = 200 + 16; // 200px width + 16px gap

  const handlePinnedScroll = () => {
    if (pinnedRef.current) {
      setPinnedCanScrollLeft(pinnedRef.current.scrollLeft > 0);
      setPinnedCanScrollRight(
        pinnedRef.current.scrollLeft <
          pinnedRef.current.scrollWidth - pinnedRef.current.clientWidth,
      );
    }
  };

  const handleRecentScroll = () => {
    if (recentRef.current) {
      setRecentCanScrollLeft(recentRef.current.scrollLeft > 0);
      setRecentCanScrollRight(
        recentRef.current.scrollLeft <
          recentRef.current.scrollWidth - recentRef.current.clientWidth,
      );
    }
  };

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

  const scrollPinnedLeft = () => {
    if (pinnedRef.current) {
      pinnedRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollPinnedRight = () => {
    if (pinnedRef.current) {
      pinnedRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRecentLeft = () => {
    if (recentRef.current) {
      recentRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRecentRight = () => {
    if (recentRef.current) {
      recentRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
    }
  };

  return {
    pinnedRef,
    recentRef,
    pinnedCanScrollLeft,
    pinnedCanScrollRight,
    recentCanScrollLeft,
    recentCanScrollRight,
    handlePinnedScroll,
    handleRecentScroll,
    handleEdit,
    handlePin,
    handleDelete,
    handleMarkPrivate,
    scrollPinnedLeft,
    scrollPinnedRight,
    scrollRecentLeft,
    scrollRecentRight,
  };
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getJournalEntries } from "@/fetchers/journal/entry-list";
import type { Mood } from "@/types/journal";
import type { JournalEntryListItem } from "@/fetchers/journal/entry-list";

const ENTRIES_PER_PAGE = 15;

export function useJournalEntries() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [mood, setMood] = useState<Mood | null>(null);
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  // Use refs to track state without causing re-renders
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchEntries = useCallback(
    async (reset: boolean = false) => {
      // Prevent duplicate fetches
      if (isFetchingRef.current) return;
      if (!reset && !hasMoreRef.current) return;

      const currentOffset = reset ? 0 : offsetRef.current + ENTRIES_PER_PAGE;

      isFetchingRef.current = true;
      setLoading(true);

      try {
        const result = await getJournalEntries({
          limit: ENTRIES_PER_PAGE,
          offset: currentOffset,
          query: query || undefined,
          sortBy,
          mood,
        });

        if (result.success && result.data) {
          setEntries((prev) =>
            reset ? result.data!.entries : [...prev, ...result.data!.entries],
          );

          hasMoreRef.current = result.data.hasMore;
          offsetRef.current = currentOffset;
          setHasMore(result.data.hasMore);
        }
      } catch (error) {
        console.error("[Fetch] Error:", error);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    [query, sortBy, mood],
  );

  // Reset and fetch when filters change
  useEffect(() => {
    setEntries([]);
    offsetRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    isFetchingRef.current = false;
    fetchEntries(true);
  }, [query, sortBy, mood, fetchEntries]);

  // Callback ref for the sentinel element - sets up observer when element mounts
  const lastEntryRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMoreRef.current &&
            !isFetchingRef.current
          ) {
            fetchEntries(false);
          }
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        },
      );

      observer.observe(node);

      // Cleanup function - disconnect observer when node unmounts
      return () => observer.disconnect();
    },
    [fetchEntries],
  );

  const handleEntryClick = useCallback(
    (entryId: number) => {
      router.push(`/user/journal/entry-section/${entryId}`);
    },
    [router],
  );

  return {
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
  };
}

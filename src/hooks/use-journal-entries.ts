import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getJournalEntries } from "@/fetchers/journal/entry-list";
import type { Mood } from "@/types/journal";
import type { JournalEntryListItem } from "@/fetchers/journal/entry-list";

export function useJournalEntries() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [mood, setMood] = useState<Mood | null>(null);
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement>(null);

  const limit = 20;

  const fetchEntries = useCallback(
    async (reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const result = await getJournalEntries({
          limit,
          offset: reset ? 0 : offset,
          query: query || undefined,
          sortBy,
          mood,
        });

        if (result.success && result.data) {
          if (reset) {
            setEntries(result.data.entries);
          } else {
            setEntries((prev) => [...prev, ...result.data!.entries]);
          }
          setHasMore(result.data.hasMore);
          if (!reset) {
            setOffset((prev) => prev + result.data!.entries.length);
          }
        }
      } catch (error) {
        console.error("Failed to fetch entries:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, offset, query, sortBy, mood],
  );

  useEffect(() => {
    // Reset and fetch when filters change
    setOffset(0);
    setEntries([]);
    setHasMore(true);
    fetchEntries(true);
  }, [query, sortBy, mood]);

  useEffect(() => {
    if (offset === 0) return; // Don't fetch on initial load

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchEntries();
        }
      },
      { threshold: 0.5, rootMargin: "0px 0px 50px 0px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, offset, fetchEntries]);

  const handleEntryClick = useCallback(
    (entryId: number) => {
      router.push(`/user/journal/entry-section/${entryId}`);
    },
    [router],
  );

  return {
    // State
    query,
    sortBy,
    mood,
    entries,
    loading,
    hasMore,
    observerRef,

    // Actions
    setQuery,
    setSortBy,
    setMood,
    handleEntryClick,
  };
}

import { getCurrentUser, requireOnboarding } from "@/actions/auth";
import EntrySection from "./client";
import { getJournalEntry } from "@/fetchers/journal/entry";
import { updateRecentlyVisited } from "@/actions/journal/update-recently-visited";

interface EntrySectionPageParams {
  entryId: string;
}

interface EntrySectionPageProps {
  params: EntrySectionPageParams;
  searchParams: { mode?: string };
}

export default async function EntrySectionPage({
  params,
  searchParams,
}: EntrySectionPageProps) {
  await requireOnboarding();
  const user = await getCurrentUser();
  if (!user?.id) return <div>Please log in</div>;

  const { entryId } = await params;
  const mode =
    (await searchParams).mode || (entryId === "new" ? "new" : "show");

  console.log("Page userId:", user.id, "entryId:", entryId, "mode:", mode);

  let entry = null;
  if (mode !== "new") {
    const result = await getJournalEntry(entryId, user.id);
    if (result.success) {
      entry = result.data;
      // Update recently visited if viewing
      if (mode === "show") {
        await updateRecentlyVisited(parseInt(entryId));
      }
    }
  }

  return (
    <EntrySection
      entryId={entryId}
      mode={mode as "new" | "show" | "edit"}
      userId={user.id}
      initialEntry={entry}
    />
  );
}

import { getCurrentUser, requireOnboarding } from "@/actions/auth";
import { getJournalHomeData } from "@/fetchers/journal/recently-visited";
import JournalHome from "@/components/journal/journal-home";

export default async function JournalPage() {
  await requireOnboarding();
  const user = await getCurrentUser();
  if (!user?.id) return <div>Please log in</div>;

  const { data } = await getJournalHomeData(user.id);

  return (
    <JournalHome
      recentEntries={data.recent}
      pinnedEntries={data.pinned}
      userImage={user.image ?? undefined}
    />
  );
}

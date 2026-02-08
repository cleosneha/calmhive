import { getCurrentUser, requireOnboarding } from "@/actions/auth";
import { getJournalHomeData } from "@/fetchers/journal/recently-visited";
import { getRandomQuote } from "@/utils/greeting";
import JournalHomeGreeting from "@/components/journal/home/journal-home-greeting";

export default async function JournalPage() {
  await requireOnboarding();
  const user = await getCurrentUser();
  if (!user?.id) return <div>Please log in</div>;

  const { data } = await getJournalHomeData(user.id);
  const quote = getRandomQuote();

  return (
    <JournalHomeGreeting
      recentEntries={data.recent}
      pinnedEntries={data.pinned}
      userImage={user.image ?? undefined}
      userName={user.name ?? undefined}
      quote={quote}
    />
  );
}

import { getCurrentUser, requireOnboarding } from "@/actions/auth";
import { getJournalHomeData } from "@/fetchers/journal/recently-visited";
import { getGreeting } from "@/utils/greeting";
import JournalHomeResponsive from "@/components/journal/home/journal-home-responsive";

export default async function JournalPage() {
  await requireOnboarding();
  const user = await getCurrentUser();
  if (!user?.id) return <div>Please log in</div>;

  const { data } = await getJournalHomeData(user.id);
  const { message, quote } = getGreeting(user.name ?? undefined);

  return (
    <JournalHomeResponsive
      recentEntries={data.recent}
      pinnedEntries={data.pinned}
      userImage={user.image ?? undefined}
      message={message}
      quote={quote}
    />
  );
}

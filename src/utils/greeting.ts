/**
 * Time-based greeting using user's actual timezone
 *
 * Rules:
 * - 03:00 – 11:59 → Good morning
 * - 12:00 – 15:59 → Good afternoon
 * - 16:00 – 02:59 → Good evening
 */

export function getTimeGreeting(
  timeZone: string,
  now: Date = new Date(),
): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(now),
  );

  if (hour >= 3 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 16) return "Good afternoon";
  return "Good evening";
}

// ------------------------------------------------------------------

const JOURNAL_QUOTES = [
  "Journaling is the voyage to the inner self where every thought finds a home.",
  "Write what should not be forgotten — your journal keeps the promise.",
  "A journal is a quiet sanctuary where small victories grow into change.",
  "What you write today becomes the guide for your tomorrow.",
  "Honesty on the page is the first step toward clarity in life.",
  "A single page can reveal progress that a month might hide.",
  "Daily reflections sharpen your focus and deepen gratitude.",
  "Your journal is the mirror that shows growth not visible at first glance.",
  "Putting feelings into words is how we begin to heal and learn.",
  "Consistency in journaling turns fleeting moments into a meaningful story.",
];

// ------------------------------------------------------------------

/**
 * Returns greeting message + random journaling quote
 */
export function getGreeting(params: {
  timeZone: string;
  userName?: string;
  now?: Date;
}) {
  const { timeZone, userName, now = new Date() } = params;

  const greeting = getTimeGreeting(timeZone, now);
  const firstName = userName?.split(" ")?.[0]?.trim();
  const message = firstName ? `Hey ${firstName}, ${greeting}` : greeting;

  const quote =
    JOURNAL_QUOTES[Math.floor(Math.random() * JOURNAL_QUOTES.length)];

  return {
    message,
    quote,
  };
}

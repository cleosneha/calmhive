/**
 * Return a locale-aware greeting based on hour of day
 * - 5 <= h < 12: Good morning
 * - 12 <= h < 18: Good afternoon
 * - 18 <= h < 22: Good evening
 * - otherwise: Good night
 */
export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

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

/**
 * Return a greeting message and a random journaling quote.
 * If userName is provided, message will be: "Hey <FirstName>, <greeting>"
 */
export function getGreeting(userName?: string, now: Date = new Date()) {
  const greeting = getTimeGreeting(now);
  const firstName = userName?.split(" ")?.[0]?.trim();
  const message = firstName ? `Hey ${firstName}, ${greeting}` : greeting;

  // Simple random selection
  const quote =
    JOURNAL_QUOTES[Math.floor(Math.random() * JOURNAL_QUOTES.length)];

  return { message, quote };
}

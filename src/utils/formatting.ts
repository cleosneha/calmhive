/**
 * Format seconds as mm:ss
 */
export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format hours (float) into a human-friendly string like "1h 30m" or "45m"
 */
export function formatHoursHuman(hours: number): string {
  const totalMins = Math.round(hours * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  if (h > 0 && m > 0) return `${h} hr ${m} mins`;
  if (h > 0) return `${h} hr`;
  return `${m} mins`;
}

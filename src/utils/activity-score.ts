export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

const SCORE_THRESHOLDS = {
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 10,
} as const;

export function calculateActivityLevel(totalScore: number): ActivityLevel {
  if (totalScore >= SCORE_THRESHOLDS.level4) return 4;
  if (totalScore >= SCORE_THRESHOLDS.level3) return 3;
  if (totalScore >= SCORE_THRESHOLDS.level2) return 2;
  if (totalScore >= SCORE_THRESHOLDS.level1) return 1;
  return 0;
}

export function calculateDayScore(day: {
  tasksCompleted: number;
  journalEntries: number;
  moodLogged: boolean;
  habitsCompleted: number;
  focusSessions: number;
}): number {
  let score = 0;
  score += day.tasksCompleted * 1;
  score += day.journalEntries * 2;
  if (day.moodLogged) score += 1;
  score += day.habitsCompleted * 2;
  score += day.focusSessions * 1;
  return score;
}

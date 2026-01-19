import { parseTimeRangeDuration } from "@/ai/agents/insights";
import { TaskStatus } from "@prisma/client";

interface Task {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: string;
  notes: string | null;
}

interface TaskStatistics {
  total: number;
  completed: number;
  partial: number;
  pending: number;
}

interface DayPerformance {
  [day: string]: {
    completed: number;
    partial: number;
    pending: number;
    totalMinutes: number;
  };
}

/**
 * Calculate task statistics (counts by status)
 */
export function calculateTaskStatistics(tasks: Task[]): TaskStatistics {
  return tasks.reduce(
    (stats, task) => {
      stats.total++;
      if (task.status === "done") stats.completed++;
      else if (task.status === "partial") stats.partial++;
      else stats.pending++;
      return stats;
    },
    { total: 0, completed: 0, partial: 0, pending: 0 },
  );
}

/**
 * Calculate average time spent per task in hours
 */
export function calculateAverageTimeSpent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const totalMinutes = tasks.reduce(
    (sum, task) => sum + parseTimeRangeDuration(task.timeRange),
    0,
  );

  return totalMinutes / tasks.length / 60; // Convert to hours
}

/**
 * Calculate consistency score
 * Formula: (completed + 0.5 * partial) / total * 100
 */
export function calculateConsistencyScore(
  completed: number,
  partial: number,
  total: number,
): number {
  if (total === 0) return 0;
  return ((completed + partial * 0.5) / total) * 100;
}

/**
 * Calculate trending completion (comparison with previous week)
 */
export function calculateTrendingCompletion(
  currentCompleted: number,
  currentTotal: number,
  previousCompleted: number | null,
  previousTotal: number | null,
): number {
  if (
    !previousCompleted ||
    !previousTotal ||
    previousTotal === 0 ||
    currentTotal === 0
  ) {
    return 0;
  }

  const previousRate = (previousCompleted / previousTotal) * 100;
  const currentRate = (currentCompleted / currentTotal) * 100;

  return currentRate - previousRate;
}

/**
 * Analyze performance by day of the week
 */
export function analyzeDayPerformance(tasks: Task[]): DayPerformance {
  return tasks.reduce((performance, task) => {
    if (!performance[task.day]) {
      performance[task.day] = {
        completed: 0,
        partial: 0,
        pending: 0,
        totalMinutes: 0,
      };
    }

    const dayStats = performance[task.day];
    dayStats.totalMinutes += parseTimeRangeDuration(task.timeRange);

    if (task.status === "done") dayStats.completed++;
    else if (task.status === "partial") dayStats.partial++;
    else dayStats.pending++;

    return performance;
  }, {} as DayPerformance);
}

/**
 * Get the top performing day (most completed tasks)
 */
export function getTopPerformingDay(dayPerformance: DayPerformance): string {
  const entries = Object.entries(dayPerformance);

  if (entries.length === 0) return "N/A";

  return entries.sort((a, b) => b[1].completed - a[1].completed)[0][0];
}

/**
 * Round number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}

/**
 * Validate that insight data is within expected ranges
 */
export function validateInsightData(data: {
  totalTasks: number;
  completedTasks: number;
  consistencyScore: number;
  averageTimeSpent: number;
}): boolean {
  return (
    data.totalTasks >= 0 &&
    data.completedTasks >= 0 &&
    data.completedTasks <= data.totalTasks &&
    data.consistencyScore >= 0 &&
    data.consistencyScore <= 100 &&
    data.averageTimeSpent >= 0 &&
    data.averageTimeSpent <= 24 // Max 24 hours per task
  );
}

/**
 * Create task summary for LLM input
 */
export function createTaskSummary(tasks: Task[]): Array<{
  day: string;
  activity: string;
  status: string;
  timeRange: string;
}> {
  return tasks.map((t) => ({
    day: t.day,
    activity: t.activity,
    status: t.status,
    timeRange: t.timeRange,
  }));
}

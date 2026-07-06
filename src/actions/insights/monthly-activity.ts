"use server";

import { prisma } from "@/lib/db";
import type { DayActivity } from "@/types/activity";
import { calculateDayScore } from "@/utils/activity-score";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getMonthlyActivityData(
  userId: string,
  year: number,
  month: number,
): Promise<DayActivity[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const endDateEnd = new Date(endDate);
  endDateEnd.setDate(endDateEnd.getDate() + 1);

  const [journalEntries, tasks] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        mood: true,
      },
    }),
    prisma.task.findMany({
      where: {
        plan: { userId },
      },
      select: {
        updatedAt: true,
        day: true,
        status: true,
      },
    }),
  ]);

  const journalByDate = new Map<string, { count: number; hasMood: boolean }>();
  for (const entry of journalEntries) {
    const key = toDateKey(entry.date);
    const existing = journalByDate.get(key) ?? { count: 0, hasMood: false };
    existing.count++;
    if (entry.mood) existing.hasMood = true;
    journalByDate.set(key, existing);
  }

  const tasksByDate = new Map<string, number>();
  const tasksByDay = new Map<string, { completed: number; total: number }>();
  for (const task of tasks) {
    if (task.status === "done") {
      const key = toDateKey(task.updatedAt);
      tasksByDate.set(key, (tasksByDate.get(key) ?? 0) + 1);
    }

    const existing = tasksByDay.get(task.day) ?? { completed: 0, total: 0 };
    existing.total += 1;
    tasksByDay.set(task.day, existing);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const result: DayActivity[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const key = toDateKey(date);
    const dayName = DAY_NAMES[date.getDay()];
    const journal = journalByDate.get(key) ?? { count: 0, hasMood: false };
    const taskStats = tasksByDay.get(dayName) ?? { completed: 0, total: 0 };
    const completedCount = tasksByDate.get(key) ?? 0;
    const taskCompletionRate =
      taskStats.total > 0 ? completedCount / taskStats.total : 0;

    const dayData = {
      date: key,
      tasksCompleted: completedCount,
      tasksTotal: taskStats.total,
      taskCompletionRate,
      journalEntries: journal.count,
      moodLogged: journal.hasMood,
      habitsCompleted: 0,
      focusSessions: 0,
      totalScore: 0,
    };

    dayData.totalScore = calculateDayScore(dayData);
    result.push(dayData);
  }

  return result;
}

export async function getActivityGraphData(
  userId: string,
  monthsBack = 12,
): Promise<DayActivity[]> {
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth() - (monthsBack - 1),
    1,
  );
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const endDateEnd = new Date(endDate);
  endDateEnd.setDate(endDateEnd.getDate() + 1);

  const [journalEntries, tasks] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        mood: true,
      },
    }),
    prisma.task.findMany({
      where: {
        plan: { userId },
      },
      select: {
        updatedAt: true,
        day: true,
        status: true,
      },
    }),
  ]);

  const journalByDate = new Map<string, { count: number; hasMood: boolean }>();
  for (const entry of journalEntries) {
    const key = toDateKey(entry.date);
    const existing = journalByDate.get(key) ?? { count: 0, hasMood: false };
    existing.count++;
    if (entry.mood) existing.hasMood = true;
    journalByDate.set(key, existing);
  }

  const tasksByDate = new Map<string, number>();
  const tasksByDay = new Map<string, { completed: number; total: number }>();
  for (const task of tasks) {
    if (task.status === "done") {
      const key = toDateKey(task.updatedAt);
      tasksByDate.set(key, (tasksByDate.get(key) ?? 0) + 1);
    }

    const existing = tasksByDay.get(task.day) ?? { completed: 0, total: 0 };
    existing.total += 1;
    tasksByDay.set(task.day, existing);
  }

  const result: DayActivity[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = toDateKey(cursor);
    const dayName = DAY_NAMES[cursor.getDay()];
    const journal = journalByDate.get(key) ?? { count: 0, hasMood: false };
    const taskStats = tasksByDay.get(dayName) ?? { completed: 0, total: 0 };
    const completedCount = tasksByDate.get(key) ?? 0;
    const taskCompletionRate =
      taskStats.total > 0 ? completedCount / taskStats.total : 0;

    const dayData = {
      date: key,
      tasksCompleted: completedCount,
      tasksTotal: taskStats.total,
      taskCompletionRate,
      journalEntries: journal.count,
      moodLogged: journal.hasMood,
      habitsCompleted: 0,
      focusSessions: 0,
      totalScore: 0,
    };

    dayData.totalScore = calculateDayScore(dayData);
    result.push(dayData);

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

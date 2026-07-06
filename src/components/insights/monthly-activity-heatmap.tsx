"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCalendarAlt } from "react-icons/fa";

import type { DayActivity } from "@/types/activity";
import type { ActivityLevel } from "@/utils/activity-score";

interface MonthlyActivityHeatmapProps {
  activityData: DayActivity[];
  isLoading?: boolean;
  monthsBack?: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEVEL_COLORS: Record<ActivityLevel, string> = {
  0: "bg-[#ebfaf4]",
  1: "bg-[#b8edda]",
  2: "bg-[#69dbb5]",
  3: "bg-[#19c496]",
  4: "bg-[#0e8a6a]",
};

const LEVEL_HOVER_COLORS: Record<ActivityLevel, string> = {
  0: "hover:bg-[#d6f5e8]",
  1: "hover:bg-[#a3e6ce]",
  2: "hover:bg-[#4dd2a3]",
  3: "hover:bg-[#14b085]",
  4: "hover:bg-[#0a7558]",
};

const LEVEL_CLASSES: Record<ActivityLevel, string> = {
  0: "border border-[#d0e6dc]",
  1: "border border-[#a3e6ce]",
  2: "border border-[#4dd2a3]",
  3: "border border-[#14b085]",
  4: "border border-[#0a7558]",
};

function formatDate(day: number, month: number, year: number): string {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildAriaLabel(
  day: number,
  month: number,
  year: number,
  activity: DayActivity | undefined,
): string {
  const dateStr = formatDate(day, month, year);
  if (!activity || activity.totalScore === 0) {
    return `${dateStr} — No activity`;
  }
  const parts = [`${dateStr}. Activity Score: ${activity.totalScore}`];
  if (activity.tasksCompleted > 0) {
    parts.push(
      `${activity.tasksCompleted} task${activity.tasksCompleted === 1 ? "" : "s"} completed`,
    );
  }
  if (activity.journalEntries > 0) {
    parts.push(
      `${activity.journalEntries} journal entr${activity.journalEntries === 1 ? "y" : "ies"}`,
    );
  }
  if (activity.moodLogged) parts.push("Mood logged");
  if (activity.habitsCompleted > 0) {
    parts.push(
      `${activity.habitsCompleted} habit${activity.habitsCompleted === 1 ? "" : "s"} completed`,
    );
  }
  if (activity.focusSessions > 0) {
    parts.push(
      `${activity.focusSessions} focus session${activity.focusSessions === 1 ? "" : "s"}`,
    );
  }
  return parts.join(". ");
}

const DAY_MS = 24 * 60 * 60 * 1000;

type ContributionCell = {
  date: Date;
  activity: DayActivity | undefined;
  level: ActivityLevel;
  isToday: boolean;
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long" });
}

function getCompletionLevel(percentage: number): ActivityLevel {
  if (percentage <= 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 100) return 3;
  return 4;
}

export function MonthlyActivityHeatmap({
  activityData,
  isLoading = false,
  monthsBack = 12,
}: MonthlyActivityHeatmapProps) {
  const today = useMemo(() => cloneDate(new Date()), []);
  const rangeStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() - (monthsBack - 1), 1),
    [today, monthsBack],
  );
  const graphStart = useMemo(
    () => addDays(rangeStart, -rangeStart.getDay()),
    [rangeStart],
  );
  const graphEnd = useMemo(() => {
    const end = cloneDate(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    return end;
  }, [today]);

  const weekCount = useMemo(
    () =>
      Math.ceil(
        (graphEnd.getTime() - graphStart.getTime() + DAY_MS) / (7 * DAY_MS),
      ),
    [graphEnd, graphStart],
  );

  const hasActivity = useMemo(
    () => activityData.some((d) => d.totalScore > 0 || d.tasksTotal > 0),
    [activityData],
  );

  const activityByDate = useMemo(() => {
    const map = new Map<string, DayActivity>();
    for (const a of activityData) {
      map.set(a.date, a);
    }
    return map;
  }, [activityData]);

  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; weekIndex: number }> = [];
    const seen = new Set<string>();
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);

    while (cursor <= today) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        const weekIndex = Math.floor(
          (cursor.getTime() - graphStart.getTime()) / (7 * DAY_MS),
        );
        labels.push({
          label: formatMonthLabel(cursor),
          weekIndex,
        });
      }
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return labels;
  }, [graphStart, rangeStart, today]);

  const contributionRows = useMemo(() => {
    return DAYS.map((_, dayIndex) => {
      return Array.from({ length: weekCount }, (_, weekIndex) => {
        const date = addDays(graphStart, weekIndex * 7 + dayIndex);
        if (date > graphEnd) {
          return null;
        }

        const activity = activityByDate.get(toDateKey(date));
        const completionRate = activity?.taskCompletionRate ?? 0;
        const level: ActivityLevel = getCompletionLevel(completionRate * 100);

        return {
          date,
          activity,
          level,
          isToday: isSameDay(date, today),
        } satisfies ContributionCell;
      });
    });
  }, [activityByDate, graphEnd, graphStart, today, weekCount]);

  return (
    <Card className="bg-white border-slate-200 h-full overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between w-full">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <FaCalendarAlt className="w-5 h-5 text-[var(--ch-sage-dark)]" />{" "}
            Activity Over Time
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-500">
            Last {monthsBack} months
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <TooltipProvider delayDuration={300}>
          <div
            className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
          >
            <div className="w-full overflow-x-auto">
              <div className="min-w-max px-4 sm:px-6 pb-6 mx-auto w-fit">
                <div
                  className={`flex flex-col gap-[2px] sm:gap-[3px] [--cell-size:11px] sm:[--cell-size:14px] [--label-width:2.5rem] sm:[--label-width:3rem] ${!hasActivity ? "opacity-40 blur-[1px]" : ""}`}
                >
                  <div
                    className="grid items-center gap-[2px] sm:gap-[3px] text-[9px] sm:text-[10px] font-medium text-slate-500 leading-none"
                    style={{
                      gridTemplateColumns: `var(--label-width) repeat(${weekCount}, var(--cell-size))`,
                    }}
                  >
                    <div />
                    {Array.from({ length: weekCount }).map((_, weekIndex) => {
                      const monthLabel = monthLabels.find(
                        (label) => label.weekIndex === weekIndex,
                      );

                      return (
                        <div
                          key={weekIndex}
                          className="text-center whitespace-nowrap"
                        >
                          {monthLabel?.label ?? ""}
                        </div>
                      );
                    })}
                  </div>

                  {contributionRows.map((weekRow, dayIndex) => (
                    <div
                      key={DAYS[dayIndex]}
                      className="grid items-center gap-[2px] sm:gap-[3px]"
                      style={{
                        gridTemplateColumns: `var(--label-width) repeat(${weekCount}, var(--cell-size))`,
                      }}
                    >
                      <div className="pr-2 text-right text-[9px] sm:text-[10px] font-medium text-slate-500 leading-none">
                        <span className="hidden sm:inline">
                          {DAYS[dayIndex]}
                        </span>
                        <span className="sm:hidden">
                          {DAYS[dayIndex].slice(0, 1)}
                        </span>
                      </div>

                      {weekRow.map((cell, weekIndex) => {
                        if (!cell) {
                          return (
                            <div
                              key={`${DAYS[dayIndex]}-${weekIndex}`}
                              className="h-[11px] w-[11px] sm:h-[14px] sm:w-[14px]"
                            />
                          );
                        }

                        return (
                          <Tooltip key={toDateKey(cell.date)}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={[
                                  "h-[11px] w-[11px] sm:h-[14px] sm:w-[14px] rounded-[2px] cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ch-sage-dark)]",
                                  LEVEL_COLORS[cell.level],
                                  LEVEL_HOVER_COLORS[cell.level],
                                  LEVEL_CLASSES[cell.level],
                                  cell.isToday
                                    ? "ring-[1.5px] ring-[var(--ch-sage-dark)] ring-offset-[0.5px]"
                                    : "",
                                ].join(" ")}
                                aria-label={buildAriaLabel(
                                  cell.date.getDate(),
                                  cell.date.getMonth() + 1,
                                  cell.date.getFullYear(),
                                  cell.activity,
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="z-50 max-w-[220px] rounded-md border border-slate-200 bg-white px-3 py-3 text-xs leading-relaxed text-slate-700 shadow-lg shadow-slate-200/70"
                            >
                              {cell.activity && cell.activity.totalScore > 0 ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm">
                                    {formatDate(
                                      cell.date.getDate(),
                                      cell.date.getMonth() + 1,
                                      cell.date.getFullYear(),
                                    )}
                                  </p>
                                  <p className="font-medium">
                                    Activity Score: {cell.activity.totalScore}
                                  </p>
                                  {cell.activity.tasksTotal > 0 && (
                                    <p className="font-medium">
                                      Tasks: {cell.activity.tasksCompleted}/
                                      {cell.activity.tasksTotal} completed
                                    </p>
                                  )}
                                  <div className="pt-1 border-t border-slate-200 space-y-0.5">
                                    {cell.activity.tasksCompleted > 0 && (
                                      <p>
                                        ✅ Tasks: {cell.activity.tasksCompleted}
                                      </p>
                                    )}
                                    {cell.activity.journalEntries > 0 && (
                                      <p>
                                        📖 Journal:{" "}
                                        {cell.activity.journalEntries}
                                      </p>
                                    )}
                                    {cell.activity.habitsCompleted > 0 && (
                                      <p>
                                        🎯 Habits:{" "}
                                        {cell.activity.habitsCompleted}
                                      </p>
                                    )}
                                    {cell.activity.moodLogged && (
                                      <p>😊 Mood Logged</p>
                                    )}
                                    {cell.activity.focusSessions > 0 && (
                                      <p>
                                        ⏱ Focus: {cell.activity.focusSessions}{" "}
                                        session
                                        {cell.activity.focusSessions === 1
                                          ? ""
                                          : "s"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p>
                                  {formatDate(
                                    cell.date.getDate(),
                                    cell.date.getMonth() + 1,
                                    cell.date.getFullYear(),
                                  )}{" "}
                                  — No activity
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                    <span>Less</span>
                    <div className="flex items-center gap-[2px] sm:gap-[3px]">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={[
                            "h-[11px] w-[11px] sm:h-[14px] sm:w-[14px] rounded-[2px] border border-transparent",
                            LEVEL_COLORS[level as ActivityLevel],
                            LEVEL_CLASSES[level as ActivityLevel],
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>

                  {!hasActivity && (
                    <p className="text-center text-sm text-slate-500">
                      No activity recorded for this month yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

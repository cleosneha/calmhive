"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: number;
  day: string;
  timeRange: string;
  activity: string;
  status: string;
  notes: string | null;
}

interface Plan {
  id: number;
  userId: string;
  daysOff: string[];
  hoursSummary: Record<string, number> | null;
  hoursSummaryHuman?: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

interface Props {
  plan: Plan;
}

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Status icons and labels removed; only activity name is displayed in table cells.

export default function PlanClient({ plan }: Props) {
  // Group tasks by day
  const tasksByDay = plan.tasks.reduce((acc, task) => {
    if (!acc[task.day]) {
      acc[task.day] = [];
    }
    acc[task.day].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get all unique time ranges across all tasks and sort them
  const timeRanges = Array.from(
    new Set(plan.tasks.map((task) => task.timeRange))
  ).sort();

  // Sort days by DAYS_ORDER and exclude days off
  const sortedDays = DAYS_ORDER.filter(
    (day) => tasksByDay[day] && !plan.daysOff.includes(day)
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--ch-sage-dark)] mb-2">
                Your Weekly Plan
              </h1>
              <p className="text-[var(--foreground)]/70">
                Stay on track with your personalized wellness plan
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
              {/* Days Off aligned with the subtitle */}
              {plan.daysOff.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--foreground)]/70">
                    Days Off:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {plan.daysOff.map((day) => (
                      <Badge
                        key={day}
                        variant="secondary"
                        className="bg-[var(--ch-sage-dark)]/10"
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* Week total aligned with the heading */}
              {(plan.hoursSummaryHuman?.weekTotal ||
                plan.hoursSummary?.weekTotal != null) && (
                <div className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="bg-[var(--ch-sage-dark)]/10"
                  >
                    Week total:{" "}
                    {plan.hoursSummaryHuman?.weekTotal ??
                      `${plan.hoursSummary?.weekTotal.toFixed(2)} hrs`}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--ch-sage-dark)]/5">
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-[var(--ch-sage-dark)] w-32">
                      Day
                    </th>
                    {timeRanges.map((timeRange) => (
                      <th
                        key={timeRange}
                        className="border border-slate-200 px-4 py-3 text-left font-semibold text-[var(--ch-sage-dark)] min-w-40"
                      >
                        {timeRange}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDays.map((day, idx) => (
                    <tr
                      key={day}
                      className={
                        idx % 2 === 0
                          ? "bg-white  transition-colors"
                          : "bg-[var(--ch-sage-light)]/10  transition-colors"
                      }
                    >
                      <td className="border border-slate-200 px-4 py-3">
                        <div className="flex flex-col">
                          <div className="font-semibold text-[var(--ch-sage-dark)]">
                            {day}
                          </div>
                          {plan.hoursSummaryHuman &&
                          plan.hoursSummaryHuman[day] ? (
                            <Badge
                              variant="secondary"
                              className="mt-2 bg-[var(--ch-sage-dark)]/10 text-sm"
                            >
                              {plan.hoursSummaryHuman[day]}
                            </Badge>
                          ) : plan.hoursSummary &&
                            plan.hoursSummary[day] != null ? (
                            <Badge
                              variant="secondary"
                              className="mt-2 bg-[var(--ch-sage-dark)]/10 text-sm"
                            >
                              {plan.hoursSummary[day].toFixed(2)} hrs
                            </Badge>
                          ) : (
                            <div className="text-[var(--foreground)]/30 text-sm mt-2">
                              —
                            </div>
                          )}
                        </div>
                      </td>
                      {timeRanges.map((timeRange) => {
                        const task = tasksByDay[day]?.find(
                          (t) => t.timeRange === timeRange
                        );
                        return (
                          <td
                            key={`${day}-${timeRange}`}
                            className="border border-slate-200 px-4 py-3"
                          >
                            {task ? (
                              <p className="font-medium text-[var(--ch-sage-dark)] text-sm">
                                {task.activity}
                              </p>
                            ) : (
                              <div className="text-[var(--foreground)]/30 text-sm">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

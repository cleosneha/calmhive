import { Badge } from "@/components/ui/badge";
import TaskHoverCard from "@/components/plan/hover-card";

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
  onEdit?: (taskId: number) => void;
  onRefresh?: () => Promise<void>; // Refetch plan after task save
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

export default function PlanTable({ plan, onEdit, onRefresh }: Props) {
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
    <div className="shadow-lg overflow-hidden">
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
                    {plan.hoursSummaryHuman && plan.hoursSummaryHuman[day] ? (
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-[var(--ch-sage-dark)]/10 text-sm"
                      >
                        {plan.hoursSummaryHuman[day]}
                      </Badge>
                    ) : plan.hoursSummary && plan.hoursSummary[day] != null ? (
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
                        <TaskHoverCard
                          task={task}
                          activity={task.activity}
                          notes={task.notes}
                          status={task.status}
                          onEdit={() =>
                            onEdit
                              ? onEdit(task.id)
                              : window.alert(`Edit task ${task.id}`)
                          }
                          onTaskSaved={onRefresh}
                          onTaskSave={async (updatedTask) => {
                            // Tasks updated via save-edit action in dialog
                            // This callback is for UI updates if needed
                            console.log("Task saved:", updatedTask);
                          }}
                        >
                          <p className="font-medium text-[var(--ch-sage-dark)] text-sm cursor-pointer hover:text-[var(--ch-sage)] transition-colors">
                            {task.activity}
                          </p>
                        </TaskHoverCard>
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
    </div>
  );
}

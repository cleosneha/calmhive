"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import TaskHoverCard from "@/components/plan/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTaskStatus } from "@/actions/plan/update-task-status";
import { removeTask } from "@/actions/plan/remove-task";
import { toast } from "sonner";
import { FiTrash2 } from "react-icons/fi";

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

export default function PlanTable({ plan, onEdit, onRefresh }: Props) {
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort tasks by day and time
  const sortedTasks = plan.tasks
    .filter((task) => !plan.daysOff.includes(task.day))
    .sort((a, b) => {
      const dayOrder = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.timeRange.localeCompare(b.timeRange);
    });

  const statusClasses: Record<string, string> = {
    done: "text-emerald-700 bg-emerald-50",
    partial: "text-yellow-600 bg-yellow-50",
    pending: "text-amber-600 bg-amber-50",
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setUpdatingStatusId(taskId);
    try {
      const result = await updateTaskStatus({
        taskId,
        status: newStatus as "pending" | "done" | "partial",
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Status updated successfully");

      // Refresh plan data
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setIsDeleting(true);
    try {
      const result = await removeTask({ taskId });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result.data?.planDeleted) {
        toast.success(
          "Task removed! Your entire plan has been deleted. You can create a new one."
        );
      } else {
        toast.success("Task removed successfully");
      }

      // Refresh plan data
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleteConfirmId(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="shadow-lg overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--ch-sage-dark)]/5">
              <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-[var(--ch-sage-dark)]">
                Day
              </th>
              <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-[var(--ch-sage-dark)]">
                Activity
              </th>
              <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-[var(--ch-sage-dark)]">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (sortedTasks.length === 0) {
                return (
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-slate-200 px-4 py-8 text-center text-[var(--foreground)]/60"
                    >
                      No tasks scheduled
                    </td>
                  </tr>
                );
              }

              const dayOrder = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ];

              const grouped: Record<string, Task[]> = {};
              for (const t of sortedTasks) {
                grouped[t.day] = grouped[t.day] || [];
                grouped[t.day].push(t);
              }

              return dayOrder.map((day) => {
                const tasks = grouped[day];
                if (!tasks || tasks.length === 0) return null;

                return tasks.map((task, i) => (
                  <tr
                    key={task.id}
                    className={
                      i % 2 === 0
                        ? "bg-white transition-colors"
                        : "bg-[var(--ch-sage-light)]/10 transition-colors"
                    }
                  >
                    {i === 0 && (
                      <td
                        className="border border-slate-200 px-4 py-3 align-top"
                        rowSpan={tasks.length}
                      >
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
                    )}

                    <td className="border border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
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
                            console.log("Task saved:", updatedTask);
                          }}
                        >
                          <p className="font-medium text-[var(--ch-sage-dark)] text-sm cursor-pointer hover:text-[var(--ch-sage-dark)]/80 transition-colors">
                            {task.activity}
                          </p>
                        </TaskHoverCard>

                        <div className="flex items-center gap-2">
                          <Select
                            value={task.status}
                            onValueChange={(value) =>
                              handleStatusChange(task.id, value)
                            }
                            disabled={updatingStatusId === task.id}
                          >
                            <SelectTrigger
                              className={`w-auto px-2 py-0.5 text-xs font-medium border-0 shadow-none ${
                                statusClasses[task.status] ?? ""
                              }`}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="done">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                                  Done
                                </div>
                              </SelectItem>
                              <SelectItem value="partial">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                                  Partially Done
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <button
                            onClick={() => setDeleteConfirmId(task.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600 hover:text-red-700"
                            title="Delete task"
                            disabled={isDeleting}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="border border-slate-200 px-4 py-3">
                      <p className="text-sm text-[var(--foreground)]">
                        {task.timeRange}
                      </p>
                    </td>
                  </tr>
                ));
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            {plan.tasks.length === 1
              ? "This is the only task in your plan. Deleting it will remove your entire plan. You can create a new plan afterwards. Are you sure you want to proceed?"
              : "Are you sure you want to delete this task? This action cannot be undone."}
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  handleDeleteTask(deleteConfirmId);
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

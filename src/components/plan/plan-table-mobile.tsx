"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { updateTaskStatus } from "@/actions/plan/update-task-status";
import TaskEditDialog from "@/components/plan/task-edit";
import { toast } from "sonner";
import { FiEdit2 } from "react-icons/fi";

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
  onRefresh?: () => Promise<void>;
}

export default function PlanTableMobile({ plan, onRefresh }: Props) {
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

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
    skipped: "text-red-600 bg-red-50",
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setUpdatingStatusId(taskId);
    try {
      const result = await updateTaskStatus({
        taskId,
        status: newStatus as "pending" | "done" | "skipped" | "partial",
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Status updated successfully");

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

  return (
    <div className="space-y-4 py-4 w-full">
      <Accordion type="single" collapsible className="w-full">
        {dayOrder.map((day) => {
          const tasks = grouped[day];
          if (!tasks || tasks.length === 0) return null;

          const dayHours =
            plan.hoursSummaryHuman?.[day] ||
            (plan.hoursSummary?.[day] != null
              ? `${plan.hoursSummary[day].toFixed(2)} hrs`
              : null);

          return (
            <AccordionItem
              key={day}
              value={day}
              className="border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4 last:mb-0 bg-white"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:bg-[var(--ch-sage-dark)]/5 [&[data-state=open]>svg]:pr-2">
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-base text-[var(--ch-sage-dark)]">
                    {day}
                  </h3>
                  {dayHours && (
                    <p className="text-sm text-[var(--foreground)]/60 mt-1">
                      {dayHours}
                    </p>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-3 pb-4 px-4">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Accordion
                      key={task.id}
                      type="single"
                      collapsible
                      className="w-full"
                    >
                      <AccordionItem
                        value={`task-${task.id}`}
                        className="border border-slate-200 rounded-md px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow bg-white mb-3 last:mb-0"
                      >
                        <AccordionTrigger className="w-full py-1 px-0 hover:bg-slate-50 rounded pr-2">
                          <div className="flex gap-2 flex-col min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className=" text-[var(--ch-sage-dark)] text-sm whitespace-normal break-words line-clamp-2 leading-snug">
                                {task.activity}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap px-2 py-0.5 w-fit"
                            >
                              {task.timeRange}
                            </Badge>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-3 mt-2 border-t border-slate-200">
                          <div className="space-y-3">
                            {/* Status Selector (inside expanded content) */}
                            <div className="flex items-center gap-2.5">
                              <div className="text-sm text-[var(--foreground)]/70 font-medium">
                                Status
                              </div>
                              <Select
                                value={task.status}
                                onValueChange={(value) =>
                                  handleStatusChange(task.id, value)
                                }
                                disabled={updatingStatusId === task.id}
                              >
                                <SelectTrigger
                                  className={`w-auto px-3 py-1.5 text-sm font-medium border-0 shadow-sm h-auto rounded ${
                                    statusClasses[task.status] ?? ""
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>

                                <SelectContent side="left">
                                  <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      Pending
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="done">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                      Done
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="partial">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                      Partially Done
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="skipped">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                                      Skipped
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Notes Section */}
                            {task.notes && (
                              <div className="bg-slate-50 rounded-md p-3 shadow-sm">
                                <p className="text-sm font-semibold text-[var(--foreground)]/70 mb-2">
                                  Notes
                                </p>
                                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap break-words leading-relaxed">
                                  {task.notes}
                                </p>
                              </div>
                            )}

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingTaskId(task.id)}
                              className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-100 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                              <FiEdit2 className="w-4 h-4" />
                              Edit Task
                            </button>

                            {/* Task Edit Dialog */}
                            <TaskEditDialog
                              open={editingTaskId === task.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingTaskId(null);
                              }}
                              task={task}
                              onSave={async (updatedTask) => {
                                console.log("Task saved:", updatedTask);
                              }}
                              onTaskSaved={onRefresh}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TaskEditDialog from "@/components/plan/task-edit";
import { HolidayPopup } from "@/components/plan/holiday-popup";
import { usePlanTable } from "@/hooks/use-plan-table";
import { getDateForDayOfWeek, dateToISOString } from "@/utils/date";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

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
  holidays: Array<{
    id: number;
    date: Date;
    reason: string | null;
  }>;
}

interface Props {
  plan: Plan;
  onEdit?: (taskId: number) => void;
  onRefresh?: () => Promise<void>;
}

export default function PlanTableMobile({ plan, onRefresh }: Props) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const {
    updatingStatusId,
    deleteConfirmId,
    setDeleteConfirmId,
    isDeleting,
    holidayPopupOpen,
    setHolidayPopupOpen,
    selectedDate,
    isRemovingHoliday,
    dayOrder,
    statusClasses,
    groupedTasks,
    handleStatusChange,
    handleDeleteTask,
    handleRemoveHoliday,
    openHolidayPopup,
    isDayHoliday,
    getDayDate,
    getDayDateStr,
  } = usePlanTable(plan, onRefresh);

  return (
    <div className="space-y-4 py-4 w-full">
      <Accordion type="single" collapsible className="w-full">
        {dayOrder.map((day) => {
          const tasks = groupedTasks[day];
          if (!tasks || tasks.length === 0) return null;

          const dayHours =
            plan.hoursSummaryHuman?.[day] ||
            (plan.hoursSummary?.[day] != null
              ? `${plan.hoursSummary[day].toFixed(2)} hrs`
              : null);

          const dayDate = getDayDate(day);
          const dayDateStr = getDayDateStr(day);
          const isDayHolidayFlag = isDayHoliday(day);

          return (
            <AccordionItem
              key={day}
              value={day}
              className="border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4 last:mb-0 bg-white"
            >
              <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[var(--ch-sage-dark)]/5">
                <AccordionTrigger className="flex-1 px-0 py-0 hover:bg-transparent [&[data-state=open]>svg]:pr-2">
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

                {isDayHolidayFlag ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveHoliday(dayDateStr);
                    }}
                    disabled={isRemovingHoliday}
                    className="ml-2 text-xs px-2 py-1 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm flex-shrink-0"
                  >
                    Remove Holiday
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openHolidayPopup(dayDate);
                    }}
                    className="ml-2 text-xs px-2 py-1 rounded-2xl bg-slate-50 text-black border border-slate-500 hover:bg-slate-100 transition-colors shadow-md flex-shrink-0"
                  >
                    Mark as Holiday
                  </button>
                )}
              </div>

              <AccordionContent className="pt-3 pb-4 px-4">
                <Accordion type="single" collapsible className="w-full">
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <AccordionItem
                        key={task.id}
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

                            {/* Edit and Delete Buttons - Horizontal */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(task.id)}
                                className="flex-1 px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-100 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(task.id)}
                                className="flex-1 px-3 py-2 text-xs font-medium border border-red-300 rounded-md hover:bg-red-50 hover:shadow-sm transition-all flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                                disabled={isDeleting}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>

                            {/* Task Edit Dialog */}
                            <TaskEditDialog
                              open={editingTaskId === task.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingTaskId(null);
                              }}
                              task={task}
                              onSave={async (updatedTask) => {
                                setEditingTaskId(null);
                              }}
                              onTaskSaved={onRefresh}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

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

      {/* Holiday Popup */}
      {selectedDate && (
        <HolidayPopup
          open={holidayPopupOpen}
          onOpenChange={setHolidayPopupOpen}
          date={selectedDate}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { updateTaskStatus } from "@/actions/plan/update-task-status";
import { removeTask } from "@/actions/plan/remove-task";
import { removeHoliday } from "@/actions/plan/add-remove-holiday";
import { getDateForDayOfWeek, dateToISOString } from "@/utils/date";
import { toast } from "sonner";

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

export function usePlanTable(plan: Plan, onRefresh?: () => Promise<void>) {
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [holidayPopupOpen, setHolidayPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isRemovingHoliday, setIsRemovingHoliday] = useState(false);

  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const statusClasses: Record<string, string> = {
    done: "text-emerald-700 bg-emerald-50",
    partial: "text-yellow-600 bg-yellow-50",
    pending: "text-amber-600 bg-amber-50",
  };

  // Convert holidays array to a Set of date strings for O(1) lookup
  const holidayDates = useMemo(() => {
    const dateSet = new Set<string>();
    plan.holidays.forEach((holiday) => {
      const d = new Date(holiday.date);
      dateSet.add(d.toISOString().split("T")[0]);
    });
    return dateSet;
  }, [plan.holidays]);

  // Sort tasks by day and time
  const sortedTasks = useMemo(
    () =>
      plan.tasks
        .filter((task) => !plan.daysOff.includes(task.day))
        .sort((a, b) => {
          const dayA = dayOrder.indexOf(a.day);
          const dayB = dayOrder.indexOf(b.day);
          if (dayA !== dayB) return dayA - dayB;
          return a.timeRange.localeCompare(b.timeRange);
        }),
    [plan.tasks, plan.daysOff, dayOrder],
  );

  // Group tasks by day
  const groupedTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const t of sortedTasks) {
      grouped[t.day] = grouped[t.day] || [];
      grouped[t.day].push(t);
    }
    return grouped;
  }, [sortedTasks]);

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
          "Task removed! Your entire plan has been deleted. You can create a new one.",
        );
      } else {
        toast.success("Task removed successfully");
      }

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

  const handleRemoveHoliday = async (dayDateStr: string) => {
    setIsRemovingHoliday(true);
    try {
      const result = await removeHoliday({
        date: dayDateStr,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Holiday removed");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast.error("Failed to remove holiday");
    } finally {
      setIsRemovingHoliday(false);
    }
  };

  const openHolidayPopup = (dayDate: Date) => {
    setSelectedDate(dayDate);
    setHolidayPopupOpen(true);
  };

  const isDayHoliday = (day: string): boolean => {
    const dayDate = getDateForDayOfWeek(day);
    const dayDateStr = dateToISOString(dayDate);
    return holidayDates.has(dayDateStr);
  };

  const getDayDate = (day: string) => {
    return getDateForDayOfWeek(day);
  };

  const getDayDateStr = (day: string) => {
    return dateToISOString(getDateForDayOfWeek(day));
  };

  return {
    // State
    updatingStatusId,
    deleteConfirmId,
    setDeleteConfirmId,
    isDeleting,
    holidayPopupOpen,
    setHolidayPopupOpen,
    selectedDate,
    isRemovingHoliday,

    // Constants
    dayOrder,
    statusClasses,

    // Computed values
    holidayDates,
    sortedTasks,
    groupedTasks,

    // Handlers
    handleStatusChange,
    handleDeleteTask,
    handleRemoveHoliday,
    openHolidayPopup,
    isDayHoliday,
    getDayDate,
    getDayDateStr,
  };
}

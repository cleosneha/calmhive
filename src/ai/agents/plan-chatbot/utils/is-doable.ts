/**
 * Determine if a requested edit is doable by the chatbot
 * Returns {isDoable: boolean, reason?: string}
 */
export function determineIfDoable(
  editType?: string,
  modifyType?: string,
): { isDoable: boolean; reason?: string } {
  // Edits that ARE FULLY DOABLE
  const doableEditTypes = [
    "add_task", // ✅ Can add new tasks with activity, time, day, notes
    "remove_task", // ✅ Can remove tasks
    "modify_task", // ✅ Can modify (but only title/notes/status, not time/day)
    "modify_task_bulk", // ✅ Can mark all tasks on a day with status
    "change_days_off", // ✅ Can update days off
    "add_days_off", // ✅ Can add days off
    "remove_days", // ✅ Can remove days from plan
    "copy_day", // ✅ Can copy day tasks
    "rename_day", // ✅ Can rename days
    "swap_days", // ✅ Can swap two days
    "delete_plan", // ✅ Can delete entire plan (dangerous but doable)
  ];

  // NOT doable edits
  const notDoableReasons: Record<string, string> = {
    other:
      "This task cannot be performed by the chatbot. Please try doing it manually.",
  };

  // Check if edit type is doable
  if (!editType || editType === "other") {
    return {
      isDoable: false,
      reason:
        notDoableReasons["other"] ||
        "This task cannot be performed by the chatbot. Please try doing it manually.",
    };
  }

  if (doableEditTypes.includes(editType)) {
    // Additional check: modify_task with unsupported modifications
    if (editType === "modify_task" && modifyType === "none") {
      return {
        isDoable: false,
        reason:
          "Modifying time or day of a task is not supported by the chatbot. Please try doing it manually.",
      };
    }

    return { isDoable: true };
  }

  return {
    isDoable: false,
    reason:
      "This task cannot be performed by the chatbot. Please try doing it manually.",
  };
}

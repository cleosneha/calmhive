import type { EditAnalysisResult, EditPreview, PreviewChange } from "../types";

/**
 * Build preview object for edit confirmation
 */
export function buildEditPreview(analysis: EditAnalysisResult): EditPreview {
  if (!analysis.extractedEdit) return {};

  const { editType, extractedEdit } = analysis;

  switch (editType) {
    case "add_task":
      return {
        after: `New Activity: **${extractedEdit.activity || "Activity"}**\n   ${
          extractedEdit.day || "Day"
        } at ${extractedEdit.timeRange || "Time"}${
          extractedEdit.notes ? `\n\nNotes:\n${extractedEdit.notes}` : ""
        }`,
        changes: [
          {
            field: "Activity",
            newValue: extractedEdit.activity || "",
          },
          {
            field: "Day",
            newValue: extractedEdit.day || "",
          },
          {
            field: "Time",
            newValue: extractedEdit.timeRange || "",
          },
        ],
      };

    case "remove_task":
      return {
        before: `Task to remove: **${extractedEdit.activity || "Task"}**\n   ${
          extractedEdit.day || "Day"
        } at ${extractedEdit.timeRange || "Time"}${
          extractedEdit.isLastTask
            ? "\n\n⚠️ This will delete your entire plan"
            : ""
        }`,
      };

    case "modify_task": {
      const changes: PreviewChange[] = [];

      if (extractedEdit.oldActivity && extractedEdit.activity) {
        changes.push({
          field: "Activity",
          oldValue: extractedEdit.oldActivity,
          newValue: extractedEdit.activity,
        });
      } else if (extractedEdit.activity) {
        changes.push({ field: "Activity", newValue: extractedEdit.activity });
      }

      if (extractedEdit.day) {
        changes.push({ field: "Day", newValue: extractedEdit.day });
      }

      if (extractedEdit.timeRange) {
        changes.push({ field: "Time", newValue: extractedEdit.timeRange });
      }

      // Handle status updates
      if (extractedEdit.modifyType === "status") {
        const statusText =
          extractedEdit.status === "done"
            ? "Completed"
            : extractedEdit.status === "pending"
              ? "Pending"
              : extractedEdit.status === "partial"
                ? "Partially Completed"
                : "Updated";
        changes.push({
          field: "Status",
          newValue: statusText,
        });
      }

      const modifyPreview: EditPreview = { changes };

      if (extractedEdit.oldActivity && extractedEdit.activity) {
        modifyPreview.before = `Old Activity: **${
          extractedEdit.oldActivity
        }**\n   ${extractedEdit.day || "Day"} at ${
          extractedEdit.timeRange || "Time"
        }`;
        modifyPreview.after = `New Activity: **${
          extractedEdit.activity
        }**\n   ${extractedEdit.day || "Day"} at ${
          extractedEdit.timeRange || "Time"
        }${extractedEdit.notes ? `\n\nNotes:\n${extractedEdit.notes}` : ""}`;
      }

      return modifyPreview;
    }

    case "change_days_off":
      return {
        after: `New days off: **${
          extractedEdit.daysOff?.join(", ") || "None"
        }**`,
        changes: [
          {
            field: "Days Off",
            newValue: extractedEdit.daysOff?.join(", ") || "None",
          },
        ],
      };

    default:
      return {};
  }
}

/**
 * Build conversational preview message for user confirmation
 */
export function buildPreviewMessage(analysis: EditAnalysisResult): string {
  const { editType, extractedEdit } = analysis;

  if (!extractedEdit) return "";

  switch (editType) {
    case "add_task":
      return (
        `Okay, the task you want to add will be added in this format:\n\n` +
        `📅 **Day:** ${extractedEdit.day}\n\n` +
        `⏰ **Time:** ${extractedEdit.timeRange}\n\n` +
        `🎯 **Activity:** ${extractedEdit.activity}${
          extractedEdit.notes ? `\n\n📝 **Notes:**\n${extractedEdit.notes}` : ""
        }\n\n` +
        `Are you okay with adding this task to your plan?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "modify_task": {
      const isActivityChanging =
        extractedEdit.activity &&
        extractedEdit.activity.toLowerCase() !==
          extractedEdit.oldActivity?.toLowerCase();

      // Handle status updates
      if (extractedEdit.modifyType === "status") {
        const statusText =
          extractedEdit.status === "done"
            ? "completed"
            : extractedEdit.status === "pending"
              ? "pending"
              : extractedEdit.status === "partial"
                ? "partially completed"
                : "updated";
        return (
          `Okay, I found the task **${extractedEdit.oldActivity}** on **${extractedEdit.day}** at **${extractedEdit.timeRange}**.\n\n` +
          `This task will be marked as **${statusText}**.\n\n` +
          `Are you sure you want to update the status of this task?\n\n` +
          `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
        );
      }

      if (isActivityChanging) {
        return (
          `Okay, I found the task **${extractedEdit.oldActivity}** on **${extractedEdit.day}** at **${extractedEdit.timeRange}**.\n\n` +
          `The updated task will be:\n\n` +
          `📅 **Day:** ${extractedEdit.day}\n` +
          `⏰ **Time:** ${extractedEdit.timeRange}\n` +
          `🎯 **Activity:** ${extractedEdit.activity}${
            extractedEdit.notes ? `\n📝 **Notes:**\n${extractedEdit.notes}` : ""
          }\n\n` +
          `Are you okay with these changes?\n\n` +
          `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
        );
      } else {
        return (
          `Okay, I found the task **${extractedEdit.oldActivity}** on **${extractedEdit.day}** at **${extractedEdit.timeRange}**.\n\n` +
          `The updated notes will be:\n\n` +
          `📝 **Notes:**\n${extractedEdit.notes}\n\n` +
          `Are you okay with updating the notes?\n\n` +
          `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
        );
      }
    }

    case "modify_task_bulk": {
      const statusText =
        extractedEdit.status === "done"
          ? "completed"
          : extractedEdit.status === "pending"
            ? "pending"
            : extractedEdit.status === "partial"
              ? "partially completed"
              : "updated";
      return (
        `Perfect! I will mark all activities on **${extractedEdit.day}** as **${statusText}**.\n\n` +
        `Are you sure you want to update the status of all activities on this day?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );
    }

    case "remove_task":
      return (
        `Are you sure you want to remove this task?\n\n` +
        `📅 **Day:** ${extractedEdit.day}\n` +
        `⏰ **Time:** ${extractedEdit.timeRange}\n` +
        `🎯 **Activity:** ${extractedEdit.activity}${
          extractedEdit.isLastTask
            ? "\n\n⚠️ **Warning:** This is the only task in your plan. Removing it will delete your entire plan. You will need to create a new plan afterwards."
            : "\n\n⚠️ **Note:** This change is permanent and cannot be undone."
        }\n\n` +
        `Do you want to proceed with removing this task?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "change_days_off":
      return (
        `Okay, your days off will be updated to:\n\n` +
        `📅 **Days Off:** ${extractedEdit.daysOff?.join(", ") || "None"}\n\n` +
        `Are you okay with these changes?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "add_days_off":
      return (
        `Okay, these days will be added to your days off:\n\n` +
        `📅 **Days to Add:** ${extractedEdit.daysToAdd?.join(", ") || "None"}\n\n` +
        `Are you okay with adding these days off?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "remove_days":
      return (
        `Are you sure you want to remove these days from your plan?\n\n` +
        `📅 **Days to Remove:** ${extractedEdit.daysToRemove?.join(", ") || "None"}\n\n` +
        `⚠️ **Note:** This will permanently remove all tasks from these days. This change cannot be undone.\n\n` +
        `Do you want to proceed?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "copy_day":
      return (
        `Okay, the tasks from **${extractedEdit.sourceDay}** will be copied to **${extractedEdit.targetDay}**.\n\n` +
        `Are you okay with copying all tasks from ${extractedEdit.sourceDay} to ${extractedEdit.targetDay}?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "rename_day":
      return (
        `Okay, **${extractedEdit.sourceDay}** will be renamed to **${extractedEdit.targetDay}**.\n\n` +
        `Are you okay with renaming ${extractedEdit.sourceDay} to ${extractedEdit.targetDay}?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "swap_days":
      return (
        `Okay, **${extractedEdit.day1}** and **${extractedEdit.day2}** will be swapped.\n\n` +
        `All tasks from ${extractedEdit.day1} will move to ${extractedEdit.day2}, and vice versa.\n\n` +
        `Are you okay with swapping these two days?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    case "delete_plan":
      return (
        `⚠️ **Warning:** You are about to delete your entire plan.\n\n` +
        `This will permanently remove all tasks and cannot be undone. You will need to create a new plan afterwards.\n\n` +
        `Are you absolutely sure you want to delete your entire plan?\n\n` +
        `[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`
      );

    default:
      return `Are you okay with this change?\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;
  }
}

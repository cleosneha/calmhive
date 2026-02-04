import type { EditPreview, PreviewChange, EditType } from "../types";

interface PreviewData {
  day?: string;
  timeRange?: string;
  activity?: string;
  oldActivity?: string;
  notes?: string;
  status?: string;
  daysOff?: string[];
  daysToRemove?: string[];
  daysToAdd?: string[];
  sourceDay?: string;
  targetDay?: string;
  targetDays?: string[];
  day1?: string;
  day2?: string;
  isLastTask?: boolean;
}

/**
 * Build preview object for edit confirmation
 */
export function buildEditPreview(
  editType: EditType,
  data: PreviewData,
): EditPreview {
  switch (editType) {
    case "add_task":
      return {
        after:
          `New Activity: **${data.activity || "Activity"}**\n` +
          `${data.day || "Day"} at ${data.timeRange || "Time"}` +
          `${data.notes ? `\n\nNotes:\n${data.notes}` : ""}`,
        changes: [
          { field: "Activity", newValue: data.activity || "" },
          { field: "Day", newValue: data.day || "" },
          { field: "Time", newValue: data.timeRange || "" },
        ],
      };

    case "remove_task":
      return {
        before:
          `Task to remove: **${data.activity || "Task"}**\n` +
          `${data.day || "Day"} at ${data.timeRange || "Time"}` +
          `${data.isLastTask ? "\n\n⚠️ This will delete your entire plan" : ""}`,
      };

    case "modify_task": {
      const changes: PreviewChange[] = [];

      if (data.oldActivity && data.activity) {
        changes.push({
          field: "Activity",
          oldValue: data.oldActivity,
          newValue: data.activity,
        });
      }

      if (data.status) {
        const statusText =
          data.status === "done"
            ? "Completed"
            : data.status === "pending"
              ? "Pending"
              : data.status === "partial"
                ? "Partially Completed"
                : "Updated";
        changes.push({ field: "Status", newValue: statusText });
      }

      return {
        before: data.oldActivity
          ? `Old Activity: **${data.oldActivity}**\n${data.day || "Day"} at ${data.timeRange || "Time"}`
          : undefined,
        after: data.activity
          ? `New Activity: **${data.activity}**\n${data.day || "Day"} at ${data.timeRange || "Time"}${data.notes ? `\n\nNotes:\n${data.notes}` : ""}`
          : undefined,
        changes,
      };
    }

    case "add_days_off":
      return {
        after: `New days off: **${data.daysToAdd?.join(", ") || "None"}**`,
        changes: [
          { field: "Days Off", newValue: data.daysToAdd?.join(", ") || "None" },
        ],
      };

    case "remove_days":
      return {
        changes: [
          {
            field: "Days to Remove",
            oldValue: data.daysToRemove?.join(", ") || "",
            newValue: "Deleted",
          },
        ],
      };

    case "copy_day":
      return {
        after: `Copy tasks from **${data.sourceDay}** to **${data.targetDays?.join(", ") || data.targetDay}**`,
        changes: [
          { field: "Source Day", newValue: data.sourceDay || "" },
          {
            field: "Target Day(s)",
            newValue: data.targetDays?.join(", ") || data.targetDay || "",
          },
        ],
      };

    case "swap_days":
      return {
        after: `Swap tasks between **${data.day1}** and **${data.day2}**`,
        changes: [
          { field: "Day 1", newValue: data.day1 || "" },
          { field: "Day 2", newValue: data.day2 || "" },
        ],
      };

    case "rename_day":
      return {
        after: `Move tasks from **${data.sourceDay}** to **${data.targetDay}**`,
        changes: [
          { field: "From", newValue: data.sourceDay || "" },
          { field: "To", newValue: data.targetDay || "" },
        ],
      };

    case "delete_plan":
      return {
        before: "Your entire wellness plan",
        after: "⚠️ **DELETED** - This cannot be undone!",
      };

    default:
      return {};
  }
}

/**
 * Build confirmation message for user
 */
export function buildConfirmationMessage(
  editType: EditType,
  data: PreviewData,
): string {
  const buttons = "\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]";

  switch (editType) {
    case "add_task":
      return (
        `Okay, the task you want to add will be added in this format:\n\n` +
        `📅 **Day:** ${data.day}\n\n` +
        `⏰ **Time:** ${data.timeRange}\n\n` +
        `🎯 **Activity:** ${data.activity}` +
        `${data.notes ? `\n\n📝 **Notes:**\n${data.notes}` : ""}\n\n` +
        `Are you okay with adding this task to your plan?` +
        buttons
      );

    case "remove_task":
      return (
        `Are you sure you want to remove this task?\n\n` +
        `📅 **Day:** ${data.day}\n` +
        `⏰ **Time:** ${data.timeRange}\n` +
        `🎯 **Activity:** ${data.activity}` +
        `${
          data.isLastTask
            ? "\n\n⚠️ **Warning:** This is the only task in your plan. Removing it will delete your entire plan."
            : "\n\n⚠️ **Note:** This change is permanent and cannot be undone."
        }` +
        `\n\nDo you want to proceed with removing this task?` +
        buttons
      );

    case "modify_task": {
      if (data.status) {
        const statusText =
          data.status === "done"
            ? "completed"
            : data.status === "pending"
              ? "pending"
              : "partially completed";
        return (
          `Okay, I found the task **${data.oldActivity}** on **${data.day}** at **${data.timeRange}**.\n\n` +
          `This task will be marked as **${statusText}**.\n\n` +
          `Are you sure you want to update the status?` +
          buttons
        );
      }

      if (data.activity && data.activity !== data.oldActivity) {
        return (
          `Okay, I found the task **${data.oldActivity}** on **${data.day}** at **${data.timeRange}**.\n\n` +
          `The updated task will be:\n\n` +
          `📅 **Day:** ${data.day}\n` +
          `⏰ **Time:** ${data.timeRange}\n` +
          `🎯 **Activity:** ${data.activity}` +
          `${data.notes ? `\n📝 **Notes:**\n${data.notes}` : ""}\n\n` +
          `Are you okay with these changes?` +
          buttons
        );
      }

      return (
        `Okay, I found the task **${data.oldActivity}** on **${data.day}** at **${data.timeRange}**.\n\n` +
        `The updated notes will be:\n\n` +
        `📝 **Notes:**\n${data.notes}\n\n` +
        `Are you okay with updating the notes?` +
        buttons
      );
    }

    case "add_days_off":
      return (
        `⚠️ **Confirmation Required**\n\n` +
        `You want to mark **${data.daysToAdd?.join(", ")}** as days off. ` +
        `These days won't have any scheduled tasks.\n\n` +
        `**Important:** Once confirmed, you won't be able to retrieve tasks for these days automatically.\n\n` +
        `Do you want to proceed?` +
        buttons
      );

    case "remove_days":
      return (
        `⚠️ **Confirmation Required**\n\n` +
        `You want to remove **${data.daysToRemove?.join(", ")}** from your plan. ` +
        `All tasks on these days will be permanently deleted.\n\n` +
        `Do you want to proceed?` +
        buttons
      );

    case "copy_day":
      const targets = data.targetDays?.join(", ") || data.targetDay;
      return (
        `⚠️ **Confirmation Required**\n\n` +
        `You want to copy tasks from **${data.sourceDay}** to **${targets}**.\n\n` +
        `This will replace any existing tasks on the target day(s).\n\n` +
        `Do you want to proceed?` +
        buttons
      );

    case "swap_days":
      return (
        `⚠️ **Confirmation Required**\n\n` +
        `You want to swap tasks between **${data.day1}** and **${data.day2}**.\n\n` +
        `All tasks from ${data.day1} will move to ${data.day2} and vice versa.\n\n` +
        `Do you want to proceed?` +
        buttons
      );

    case "rename_day":
      return (
        `⚠️ **Confirmation Required**\n\n` +
        `You want to move all tasks from **${data.sourceDay}** to **${data.targetDay}**.\n\n` +
        `This will replace any existing tasks on ${data.targetDay}.\n\n` +
        `Do you want to proceed?` +
        buttons
      );

    case "delete_plan":
      return (
        `🚨 **DANGER: Delete Entire Plan**\n\n` +
        `Are you absolutely sure you want to delete your entire wellness plan?\n\n` +
        `⚠️ **This action CANNOT be undone!**\n\n` +
        `All tasks, days off, and plan settings will be permanently lost.\n\n` +
        `Do you want to proceed with deleting your entire plan?` +
        buttons
      );

    default:
      return `Are you sure you want to make this change?${buttons}`;
  }
}

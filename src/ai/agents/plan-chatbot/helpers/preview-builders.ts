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
        before: `Task to remove: **${extractedEdit.activity || "Task"}**`,
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
      return `I have detected a new activity: **${
        extractedEdit.activity
      }** on **${extractedEdit.day}** at **${extractedEdit.timeRange}**${
        extractedEdit.notes
          ? `\n\n📋 **Suggested approach:**\n${extractedEdit.notes}`
          : ""
      }\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;

    case "modify_task": {
      const isActivityChanging =
        extractedEdit.activity &&
        extractedEdit.activity.toLowerCase() !==
          extractedEdit.oldActivity?.toLowerCase();

      if (isActivityChanging) {
        return `I have detected **${extractedEdit.oldActivity}** on **${
          extractedEdit.day
        }** at **${
          extractedEdit.timeRange
        }**\n\nNow as per your request, I suggest changing it to **${
          extractedEdit.activity
        }** at **${extractedEdit.timeRange}**${
          extractedEdit.notes
            ? `\n\n📋 **Suggested approach:**\n${extractedEdit.notes}`
            : ""
        }\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;
      } else {
        return `I have detected **${extractedEdit.oldActivity}** on **${
          extractedEdit.day
        }** at **${extractedEdit.timeRange}**${
          extractedEdit.notes
            ? `\n\nNow as per your request, I suggest updating the notes:\n\n📋 **Suggested approach:**\n${extractedEdit.notes}`
            : ""
        }\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;
      }
    }

    case "remove_task":
      return `I have detected **${extractedEdit.activity}** which you want to remove.\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;

    case "change_days_off":
      return `I have detected you want to set days off as: **${
        extractedEdit.daysOff?.join(", ") || "None"
      }**\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`;

    default:
      return "";
  }
}

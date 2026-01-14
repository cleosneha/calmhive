import type { EditAnalysisResult } from "../types";

/**
 * Build a human-readable confirmation message for plan edits
 */
export function buildEditConfirmation(analysis: EditAnalysisResult): string {
  if (!analysis.extractedEdit || !analysis.editType) {
    return "I want to make a change to your plan.";
  }

  const { extractedEdit, editType } = analysis;

  switch (editType) {
    case "add_task":
      return `I'll add **${extractedEdit.activity}** on **${extractedEdit.day}** at **${extractedEdit.timeRange}** to your plan.`;

    case "remove_task":
      if (extractedEdit.taskId) {
        return `I'll remove the task with ID ${extractedEdit.taskId} from your plan.`;
      }
      return `I'll remove **${
        extractedEdit.activity || "the specified task"
      }** from your plan.`;

    case "modify_task":
      if (extractedEdit.taskId) {
        const changes = [];
        if (extractedEdit.day) changes.push(`day to ${extractedEdit.day}`);
        if (extractedEdit.timeRange)
          changes.push(`time to ${extractedEdit.timeRange}`);
        if (extractedEdit.activity)
          changes.push(`activity to ${extractedEdit.activity}`);

        return `I'll update task ${extractedEdit.taskId}: ${changes.join(
          ", "
        )}.`;
      }
      return `I'll modify **${
        extractedEdit.activity || "the specified task"
      }** in your plan.`;

    case "change_days_off":
      if (extractedEdit.daysOff && extractedEdit.daysOff.length > 0) {
        return `I'll set your days off to: **${extractedEdit.daysOff.join(
          ", "
        )}**.`;
      }
      return "I'll update your days off.";

    default:
      return "I'll make the requested change to your plan.";
  }
}

import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";
import { findTaskByActivity } from "../../../utils/validate-remove-task";
import { buildPreviewMessage } from "../../../helpers";

export async function validateModifyTask(
  state: PlanChatbotStateType,
  analysis: EditAnalysisResult,
): Promise<{
  isValid: boolean;
  needsClarification: boolean;
  response: Partial<PlanChatbotStateType>;
}> {
  // Ensure extractedEdit exists
  if (!analysis.extractedEdit) {
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [new AIMessage("Missing edit details. Please try again.")],
        responseHandled: true,
      },
    };
  }

  const { oldActivity, day, timeRange } = analysis.extractedEdit;

  // Check if oldActivity is provided
  if (!oldActivity) {
    console.log("  ❌ MODIFY_TASK - missing old activity name");
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            'I need to know which task you want to modify. Please specify the current activity name.\n\nExample: "Change morning yoga to evening yoga" or "Replace the 7 AM workout with stretching"',
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Handle bulk status change for all activities on a day
  if (
    oldActivity.toLowerCase() === "all" &&
    analysis.extractedEdit!.modifyType === "status"
  ) {
    console.log(
      `  ✏️ BULK STATUS CHANGE - marking all activities on ${day} as ${analysis.extractedEdit!.status}`,
    );

    return {
      isValid: true,
      needsClarification: false,
      response: {
        waitingForConfirmation: true,
        pendingEdit: {
          type: "modify_task_bulk",
          data: {
            ...analysis.extractedEdit,
            oldActivity: "all",
            day: day,
            status: analysis.extractedEdit!.status,
          },
          description: `Mark all activities on ${day} as ${analysis.extractedEdit!.status}`,
          preview: {
            changes: [
              {
                field: "Status of all activities",
                newValue: analysis.extractedEdit!.status || "Unknown",
              },
            ],
          },
        },
        messages: [
          new AIMessage(
            `I will mark all activities on **${day}** as **${analysis.extractedEdit!.status}**.`,
          ),
        ],
        awaitingClarification: null,
      },
    };
  }

  // Validate and find the task
  const validation = await findTaskByActivity(
    state.userId,
    oldActivity,
    day,
    timeRange && timeRange !== "none" ? timeRange : undefined,
  );

  if (!validation.task) {
    console.log("  ❌ MODIFY_TASK - validation failed:", validation.error);
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `**Cannot modify this task.** ${validation.error}\n\nPlease check your plan and try again.`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Store the full task details for preview
  analysis.extractedEdit!.taskId = validation.task.id;
  analysis.extractedEdit!.day = validation.task.day;
  analysis.extractedEdit!.timeRange = validation.task.timeRange;
  // Keep the new activity and notes from the extraction

  // Check if user is trying to modify time - not supported
  if (
    analysis.extractedEdit!.timeRange &&
    analysis.extractedEdit!.timeRange !== "none" &&
    analysis.extractedEdit!.timeRange !== validation.task.timeRange
  ) {
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `I'm sorry, but modifying the time of existing tasks is not supported yet. You'll need to manually delete this task and create a new one at the desired time.\n\nTo delete: "${validation.task.activity}" on ${validation.task.day} at ${validation.task.timeRange}`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Check if user is trying to modify day - not supported
  if (
    analysis.extractedEdit!.day &&
    analysis.extractedEdit!.day !== validation.task.day
  ) {
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `I'm sorry, but changing the day of existing tasks is not supported yet. You'll need to manually delete this task and create a new one on the desired day.\n\nTo delete: "${validation.task.activity}" on ${validation.task.day} at ${validation.task.timeRange}`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Check modifyType - reject if "none" (unsupported modifications)
  if (analysis.extractedEdit!.modifyType === "none") {
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `I'm sorry, but that type of modification is not supported yet. You can only modify the title, notes, or status of tasks.\n\nFor other changes (like time or day), you'll need to manually delete this task and create a new one.`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  return {
    isValid: true,
    needsClarification: false,
    response: {
      waitingForConfirmation: true,
      pendingEdit: {
        type: "modify_task",
        data: analysis.extractedEdit,
        description: `Modify task: ${analysis.extractedEdit!.oldActivity} → ${analysis.extractedEdit!.activity || analysis.extractedEdit!.oldActivity}`,
        preview: {
          changes: [
            ...(analysis.extractedEdit!.activity &&
            analysis.extractedEdit!.activity !==
              analysis.extractedEdit!.oldActivity
              ? [
                  {
                    field: "Activity",
                    oldValue: analysis.extractedEdit!.oldActivity,
                    newValue: analysis.extractedEdit!.activity,
                  },
                ]
              : []),
            ...(analysis.extractedEdit!.notes
              ? [
                  {
                    field: "Notes",
                    newValue: analysis.extractedEdit!.notes,
                  },
                ]
              : []),
            ...(analysis.extractedEdit!.modifyType === "status"
              ? [
                  {
                    field: "Status",
                    oldValue: "Current status", // This could be improved to show actual current status
                    newValue: analysis.extractedEdit!.status || "Unknown",
                  },
                ]
              : []),
          ],
        },
      },
      messages: [new AIMessage(buildPreviewMessage(analysis))],
      awaitingClarification: null,
    },
  };
}

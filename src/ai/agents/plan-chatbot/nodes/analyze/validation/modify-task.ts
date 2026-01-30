import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";
import { findTaskByActivity } from "../../../utils/validate-remove-task";
import { checkTimeConflict } from "../../../helpers";
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

  // Check for time conflicts if it's a modify_task with time change
  if (
    analysis.extractedEdit!.timeRange &&
    analysis.extractedEdit!.timeRange !== "none" &&
    analysis.extractedEdit!.day
  ) {
    const conflictCheck = await checkTimeConflict(
      state.userId,
      analysis.extractedEdit!.day,
      analysis.extractedEdit!.timeRange,
      analysis.extractedEdit!.oldActivity,
    );

    if (conflictCheck.hasConflict) {
      console.log("  ⚠️ TIME CONFLICT DETECTED - overlapping times");
      return {
        isValid: false,
        needsClarification: false,
        response: {
          mode: "query",
          messages: [
            new AIMessage(
              `**Cannot make this change.** There's already a **${conflictCheck.conflictingActivity}** scheduled on **${analysis.extractedEdit!.day}** at **${conflictCheck.conflictingTime || analysis.extractedEdit!.timeRange}** that would overlap.\n\nPlease choose a different time slot or remove the conflicting activity first.`,
            ),
          ],
          responseHandled: true,
        },
      };
    }
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
            ...(analysis.extractedEdit!.day
              ? [
                  {
                    field: "Day",
                    newValue: analysis.extractedEdit!.day,
                  },
                ]
              : []),
            ...(analysis.extractedEdit!.timeRange
              ? [
                  {
                    field: "Time",
                    newValue: analysis.extractedEdit!.timeRange,
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
          ],
        },
      },
      messages: [new AIMessage(buildPreviewMessage(analysis))],
      awaitingClarification: null,
    },
  };
}

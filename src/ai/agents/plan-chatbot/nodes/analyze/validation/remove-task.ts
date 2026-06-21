import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";
import { validateRemoveTask as validateTaskRemoval } from "../../../utils";
import { buildPreviewMessage } from "../../../helpers";

export async function validateRemoveTask(
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

  // Check if activity is provided
  if (!oldActivity) {
    // console.log("  ❌ REMOVE_TASK - missing activity name");
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            'I need to know which task you want to remove. Please specify the activity name.\n\nExample: "Remove morning yoga" or "Delete the 7 AM workout"',
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Validate and find the task
  const validation = await validateTaskRemoval(
    state.userId,
    oldActivity,
    day,
    timeRange,
  );

  if (!validation.isValid) {
    // console.log("  ❌ REMOVE_TASK - validation failed:", validation.error);
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `**Cannot remove this task.** ${validation.error}\n\nPlease check your plan and try again.`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Store the full task details and isLastTask flag for preview
  analysis.extractedEdit!.taskId = validation.taskId;
  analysis.extractedEdit!.activity = validation.taskActivity;
  analysis.extractedEdit!.day = validation.taskDay;
  analysis.extractedEdit!.timeRange = validation.taskTimeRange;
  analysis.extractedEdit!.isLastTask = validation.isLastTask;

  return {
    isValid: true,
    needsClarification: false,
    response: {
      waitingForConfirmation: true,
      pendingEdit: {
        type: "remove_task",
        data: {
          taskId: validation.taskId,
          activity: validation.taskActivity,
          day: validation.taskDay,
          timeRange: validation.taskTimeRange,
          isLastTask: validation.isLastTask,
        },
        description: `Remove task: ${validation.taskActivity} on ${validation.taskDay} at ${validation.taskTimeRange}`,
        preview: {
          before: `Task to remove: **${validation.taskActivity}**\n   ${validation.taskDay} at ${validation.taskTimeRange}${
            validation.isLastTask
              ? "\n\n⚠️ This will delete your entire plan"
              : ""
          }`,
        },
      },
      messages: [new AIMessage(buildPreviewMessage(analysis))],
      awaitingClarification: null,
    },
  };
}

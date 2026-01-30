import type { PlanChatbotStateType } from "../../../state";
import type { EditAnalysisResult } from "../../../types";
import { AIMessage } from "@langchain/core/messages";
import {
  validateAddTask as validateTaskData,
  checkSimilarActivities,
} from "../../../utils/validate-add-task";
import { checkTimeConflict } from "../../../helpers";
import { buildPreviewMessage } from "../../../helpers";

export async function validateAddTask(
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

  const { day, timeRange, activity } = analysis.extractedEdit;

  // Check for vague time range first
  if (timeRange === "vague" || !timeRange) {
    console.log("  ⚠️ ADD_TASK - vague or missing time range");
    return {
      isValid: false,
      needsClarification: true,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `I'd be happy to add **${activity || "this activity"}** to your plan${day ? ` on **${day}**` : ""}! \n\n` +
              `However, I need a specific time slot. Please provide:\n` +
              `- **Exact time range** (e.g., "7:00 AM - 8:00 AM")${!day ? "\n- **Which day** (e.g., Monday, Tuesday, etc.)" : ""}\n\n` +
              `Example: "Add it on Monday from 7:00 AM to 8:00 AM"`,
          ),
        ],
        responseHandled: true,
        awaitingClarification: {
          operation: "add_task",
          context: {
            activity,
            day,
            notes: analysis.extractedEdit!.notes,
          },
        },
      },
    };
  }

  // Check if all required fields are present
  if (!day || !activity) {
    console.log("  ❌ ADD_TASK - missing required fields");
    const missingFields = [];
    if (!day) missingFields.push("day");
    if (!activity) missingFields.push("activity title");

    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `I need more information to add this task. Please provide:\n${missingFields.map((f) => `- ${f}`).join("\n")}\n\nExample: "Add morning yoga on Monday from 7:00 AM to 8:00 AM"`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Validate the task data
  const validation = await validateTaskData(
    state.userId,
    day,
    timeRange,
    activity,
  );

  if (!validation.isValid) {
    console.log("  ❌ ADD_TASK - validation failed:", validation.errors);
    return {
      isValid: false,
      needsClarification: false,
      response: {
        mode: "query",
        messages: [
          new AIMessage(
            `**Cannot add this task.** ${validation.errors.join(" ")}\n\nPlease try again with valid information.`,
          ),
        ],
        responseHandled: true,
      },
    };
  }

  // Use normalized day from validation
  if (validation.normalizedDay) {
    analysis.extractedEdit!.day = validation.normalizedDay;
  }

  // Check for similar activities on the same day
  if (
    typeof analysis.extractedEdit!.day === "string" &&
    typeof analysis.extractedEdit!.activity === "string"
  ) {
    const similarCheck = await checkSimilarActivities(
      state.userId,
      analysis.extractedEdit!.day,
      analysis.extractedEdit!.activity,
    );

    if (similarCheck.hasSimilar && similarCheck.similarActivities) {
      console.log("  ℹ️ SIMILAR ACTIVITY FOUND - rejecting addition");
      const similarList = similarCheck.similarActivities
        .map((a) => `• **${a.activity}** at ${a.timeRange}`)
        .join("\n");

      return {
        isValid: false,
        needsClarification: false,
        response: {
          mode: "query",
          messages: [
            new AIMessage(
              `I can't add **${analysis.extractedEdit!.activity}** on **${analysis.extractedEdit!.day}** because you already have a similar activity on that day:\n\n${similarList}\n\n` +
                `Please choose a different day or let me know if you'd like to replace the existing activity instead.`,
            ),
          ],
          responseHandled: true,
        },
      };
    }
  }

  // Check for time conflicts (now checks for overlapping times)
  if (
    typeof analysis.extractedEdit!.day === "string" &&
    typeof analysis.extractedEdit!.timeRange === "string"
  ) {
    const conflictCheck = await checkTimeConflict(
      state.userId,
      analysis.extractedEdit!.day,
      analysis.extractedEdit!.timeRange,
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
              `**Cannot add this task.** There's already a **${conflictCheck.conflictingActivity}** scheduled on **${analysis.extractedEdit!.day}** at **${conflictCheck.conflictingTime || analysis.extractedEdit!.timeRange}** that overlaps with your requested time.\n\nPlease choose a different time slot that doesn't overlap with existing activities.`,
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
        type: "add_task",
        data: {
          day: day!,
          timeRange: timeRange!,
          activity: activity!,
          notes: analysis.extractedEdit!.notes,
        },
        description: `Add "${activity}" on ${day} at ${timeRange}`,
        preview: {
          changes: [
            {
              field: "Activity",
              newValue: activity!,
            },
            {
              field: "Day",
              newValue: day!,
            },
            {
              field: "Time",
              newValue: timeRange!,
            },
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

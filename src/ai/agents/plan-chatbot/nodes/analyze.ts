import type { PlanChatbotStateType } from "../state";
import type { EditAnalysisResult, EditPreview } from "../types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  processUserMessage,
  buildEditConfirmation,
  HARD_CODED_MESSAGES,
} from "../utils";

/**
 * Analyze Node: Analyze user's message to determine intent
 */
export async function analyzeNode(
  state: PlanChatbotStateType
): Promise<Partial<PlanChatbotStateType>> {
  console.log("\n🔍 [analyzeNode] START");

  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    console.log("  ⚠️ No human message found");
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage ? lastMessage.content.toString() : "";

  console.log("  💬 User message:", userMessage);

  // Check for undo request
  const undoKeywords = ["undo", "revert", "go back", "reverse"];
  if (undoKeywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
    console.log("  🔄 Undo request detected");
    return {
      isUndoRequest: true,
    };
  }

  // Analyze the message using LLM (combines analysis + query answering)
  const { analysis, answer } = await processUserMessage(
    userMessage,
    state.userId
  );

  console.log("  📊 Analysis complete:", {
    isSafe: analysis.isSafe,
    isRelevant: analysis.isRelevant,
    isEditRequest: analysis.isEditRequest,
  });

  // PRIORITY 0: Handle quota exceeded
  if (analysis.quotaExceeded) {
    console.log("  ⚠️ QUOTA EXCEEDED - returning quota message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.QUOTA_EXCEEDED)],
      responseHandled: true,
    };
  }

  // PRIORITY 1: Handle safety issues
  if (!analysis.isSafe) {
    console.log("  ⚠️ SAFETY CONCERN - returning safety message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 2: Handle irrelevant messages
  if (!analysis.isRelevant) {
    console.log("  ⚠️ IRRELEVANT - returning irrelevance message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.IRRELEVANT)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 3: Handle edit requests with confirmation
  if (analysis.isEditRequest && analysis.extractedEdit) {
    console.log("  ✏️ EDIT REQUEST - preparing confirmation");
    const confirmation = buildEditConfirmation(analysis);

    // Build preview based on edit type
    const preview = buildEditPreview(analysis);
    const previewMessage = buildPreviewMessage(analysis, preview);

    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: analysis.editType || "other",
        data: analysis.extractedEdit,
        description: confirmation,
        preview,
      },
      messages: [
        new AIMessage(`${previewMessage}\n\n[CONFIRM_BUTTON]\n[CANCEL_BUTTON]`),
      ],
    };
  }

  // PRIORITY 4: Handle queries - pass answer to respond node
  console.log("  💬 QUERY - passing to respond node");
  return {
    mode: "query",
    cachedAnswer: answer, // Store answer from combined LLM call
  };
}

/**
 * Build preview for edit
 */
function buildEditPreview(analysis: EditAnalysisResult): EditPreview {
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

    case "modify_task":
      const changes = [];
      if (extractedEdit.oldActivity && extractedEdit.activity) {
        changes.push({
          field: "Activity",
          oldValue: extractedEdit.oldActivity,
          newValue: extractedEdit.activity,
        });
      } else if (extractedEdit.activity) {
        changes.push({ field: "Activity", newValue: extractedEdit.activity });
      }
      if (extractedEdit.day)
        changes.push({ field: "Day", newValue: extractedEdit.day });
      if (extractedEdit.timeRange)
        changes.push({ field: "Time", newValue: extractedEdit.timeRange });

      const modifyPreview: EditPreview = { changes };

      // Structure: Old activity, Time, Notes | Changes suggested | New Activity, Time, Notes
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
 * Build conversational preview message
 */
function buildPreviewMessage(
  analysis: EditAnalysisResult,
  preview: EditPreview
): string {
  const { editType, extractedEdit } = analysis;

  if (!extractedEdit) return "";

  switch (editType) {
    case "add_task":
      return `I have detected a new activity: **${
        extractedEdit.activity
      }** on **${extractedEdit.day}** at **${extractedEdit.timeRange}**${
        extractedEdit.notes
          ? `\n\nNow as per your request, suggestions according to me is you should do **${extractedEdit.activity}** at **${extractedEdit.timeRange}** by following these:\n${extractedEdit.notes}`
          : ""
      }\n\nShould I proceed?`;

    case "modify_task":
      return `I have detected **${extractedEdit.oldActivity}** on **${
        extractedEdit.day
      }** at **${extractedEdit.timeRange}**${
        extractedEdit.activity
          ? `\n\nNow as per your request, suggestions according to me is you should do **${
              extractedEdit.activity
            }** at **${extractedEdit.timeRange}** by following these:\n${
              extractedEdit.notes || ""
            }`
          : ""
      }\n\nShould I proceed?`;

    case "remove_task":
      return `I have detected **${extractedEdit.activity}** which you want to remove.\n\nShould I proceed?`;

    case "change_days_off":
      return `I have detected you want to set days off as: **${
        extractedEdit.daysOff?.join(", ") || "None"
      }**\n\nShould I proceed?`;

    default:
      return "";
  }
}

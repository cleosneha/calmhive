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

    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: analysis.editType || "other",
        data: analysis.extractedEdit,
        description: confirmation,
        preview,
      },
      messages: [
        new AIMessage({
          content: `${confirmation}\n\n📋 **Preview:**\n${formatPreview(
            preview
          )}\n\n**Actions:** [CONFIRM_BUTTON] [CANCEL_BUTTON]`,
        }),
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
        after: `➕ New task: **${
          extractedEdit.activity || "Activity"
        }**\n   📅 ${extractedEdit.day || "Day"} at ${
          extractedEdit.timeRange || "Time"
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
        before: `🗑️ Task to remove: **${extractedEdit.activity || "Task"}**`,
      };

    case "modify_task":
      const changes = [];
      if (extractedEdit.day)
        changes.push({ field: "Day", newValue: extractedEdit.day });
      if (extractedEdit.timeRange)
        changes.push({ field: "Time", newValue: extractedEdit.timeRange });
      if (extractedEdit.activity)
        changes.push({ field: "Activity", newValue: extractedEdit.activity });

      return {
        changes,
      };

    case "change_days_off":
      return {
        after: `📆 New days off: **${
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
 * Format preview for display
 */
function formatPreview(preview: EditPreview): string {
  const parts: string[] = [];

  if (preview.before) parts.push(preview.before);
  if (preview.after) parts.push(preview.after);

  if (preview.changes && preview.changes.length > 0) {
    parts.push(
      "\n**Changes:**\n" +
        preview.changes.map((c) => `• ${c.field}: ${c.newValue}`).join("\n")
    );
  }

  return parts.join("\n");
}

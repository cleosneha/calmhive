import type { PlanChatbotStateType } from "../state";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { processUserMessage, HARD_CODED_MESSAGES } from "../utils";
import {
  buildEditPreview,
  buildPreviewMessage,
  checkTimeConflict,
} from "../helpers";

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

  // Check for undo request - updates are irreversible
  const undoKeywords = ["undo", "revert", "go back", "reverse"];
  if (undoKeywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
    console.log(
      "  🔄 Undo request detected - informing user it's irreversible"
    );
    return {
      messages: [
        new AIMessage(
          "Plan updates are irreversible. I cannot undo changes once they've been applied. However, you can always request new changes to adjust your plan!"
        ),
      ],
      responseHandled: true,
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

    // Check for time conflicts if it's a modify_task with time change
    if (
      analysis.editType === "modify_task" &&
      analysis.extractedEdit.timeRange &&
      analysis.extractedEdit.day
    ) {
      const conflictCheck = await checkTimeConflict(
        state.userId,
        analysis.extractedEdit.day,
        analysis.extractedEdit.timeRange,
        analysis.extractedEdit.oldActivity
      );

      if (conflictCheck.hasConflict) {
        console.log("  ⚠️ TIME CONFLICT DETECTED - cannot proceed");
        return {
          mode: "query",
          messages: [
            new AIMessage(
              `**Cannot make this change.** There's already a **${conflictCheck.conflictingActivity}** scheduled on **${analysis.extractedEdit.day}** at **${analysis.extractedEdit.timeRange}**.\n\nPlease choose a different time slot or remove the conflicting activity first.`
            ),
          ],
          responseHandled: true,
        };
      }
    }

    // Build preview and message
    const preview = buildEditPreview(analysis);
    const previewMessage = buildPreviewMessage(analysis);

    return {
      waitingForConfirmation: true,
      pendingEdit: {
        type: analysis.editType || "other",
        data: analysis.extractedEdit,
        description: previewMessage,
        preview,
      },
      messages: [new AIMessage(previewMessage)],
    };
  }

  // PRIORITY 4: Handle queries - pass answer to respond node
  console.log("  💬 QUERY - passing to respond node");
  return {
    mode: "query",
    cachedAnswer: answer,
  };
}

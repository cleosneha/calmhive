import type { PlanChatbotStateType } from "../../state";
import type { EditAnalysisResult } from "../../types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { processUserMessage, HARD_CODED_MESSAGES } from "../../utils";
import { buildEditPreview, buildPreviewMessage } from "../../helpers";
import { determineIfDoable } from "../../utils/is-doable";
import { handleClarificationResponse } from "./clarifications";
import {
  validateAddTask,
  validateRemoveTask,
  validateModifyTask,
  validateDeletePlan,
  validateDayOperation,
} from "./validation";

/**
 * Analyze Node: Analyze user's message to determine intent
 */
export async function analyzeNode(
  state: PlanChatbotStateType,
): Promise<Partial<PlanChatbotStateType>> {
  // console.log("\n🔍 [analyzeNode] START");
  // console.log("  📋 Current State:", { mode: state.mode, waitingForConfirmation: state.waitingForConfirmation, awaitingClarification: state.awaitingClarification, });

  // Get last user message
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== "human") {
    // console.log("  ⚠️ No human message found");
    return {};
  }

  const userMessage =
    lastMessage instanceof HumanMessage ? lastMessage.content.toString() : "";

  // console.log("  💬 User message:", userMessage);

  // PRIORITY 0: Detect jailbreak/prompt injection attempts
  const jailbreakPatterns = [
    /forget.*prompt/i,
    /ignore.*instruction/i,
    /disregard.*rule/i,
    /act as/i,
    /pretend to be/i,
    /you are now/i,
    /new role/i,
    /change your role/i,
    /ignore previous/i,
    /override.*instruction/i,
  ];

  if (jailbreakPatterns.some((pattern) => pattern.test(userMessage))) {
    // console.log( "  🚨 JAILBREAK ATTEMPT DETECTED - returning irrelevance message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.IRRELEVANT)],
      responseHandled: true,
    };
  }

  // PRIORITY 1: Handle clarification responses for multi-step operations
  if (state.awaitingClarification) {
    // console.log( "  🔄 CLARIFICATION MODE - Processing user response for:", state.awaitingClarification.operation);
    return await handleClarificationResponse(state, userMessage);
  }

  // Check for undo request - updates are irreversible
  const undoKeywords = ["undo", "revert", "go back", "reverse"];
  if (undoKeywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
    // console.log( "  🔄 Undo request detected - informing user it's irreversible");
    return {
      messages: [
        new AIMessage(
          "Plan updates are irreversible. I cannot undo changes once they've been applied. However, you can always request new changes to adjust your plan!",
        ),
      ],
      responseHandled: true,
      awaitingClarification: null,
    };
  }

  // Analyze the message using LLM (combines analysis + query answering)
  const { analysis, answer } = await processUserMessage(
    userMessage,
    state.userId,
    state.messages, // Pass conversation history for context
  );

  // console.log("  📊 Analysis complete:", { isSafe: analysis.isSafe, isRelevant: analysis.isRelevant, isEditRequest: analysis.isEditRequest, editType: analysis.editType, });

  // PRIORITY 2: Handle quota exceeded
  if (analysis.quotaExceeded) {
    // console.log("  ⚠️ QUOTA EXCEEDED - returning quota message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.QUOTA_EXCEEDED)],
      responseHandled: true,
    };
  }

  // PRIORITY 3: Handle safety issues
  if (!analysis.isSafe) {
    // console.log("  ⚠️ SAFETY CONCERN - returning safety message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.SAFETY)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 4: Handle irrelevant messages
  if (!analysis.isRelevant) {
    // console.log("  ⚠️ IRRELEVANT - returning irrelevance message");
    return {
      messages: [new AIMessage(HARD_CODED_MESSAGES.IRRELEVANT)],
      responseHandled: true, // Prevent respond node from executing
    };
  }

  // PRIORITY 5: Handle edit requests with confirmation
  if (analysis.isEditRequest) {
    // console.log("  ✏️ EDIT REQUEST - preparing confirmation");

    // Check if edit is doable by chatbot
    const doabilityCheck = determineIfDoable(
      analysis.editType,
      analysis.extractedEdit?.modifyType,
    );
    // console.log("  🔍 Doability check:", doabilityCheck);

    if (!doabilityCheck.isDoable) {
      return {
        mode: "query",
        messages: [
          new AIMessage(
            doabilityCheck.reason ||
              "This task cannot be performed by the chatbot. Please try doing it manually.",
          ),
        ],
        responseHandled: true,
      };
    }

    // Check for unsupported edit types or multiple operations FIRST
    if (analysis.editType === "other" || !analysis.editType) {
      // console.log("  ❌ UNSUPPORTED EDIT TYPE OR MULTIPLE OPERATIONS");

      return {
        mode: "query",
        messages: [
          new AIMessage(
            "I can only process **one operation at a time**. \n\n" +
              "**Currently supported operations:**\n" +
              "• Add/remove/modify tasks\n" +
              "• Mark days as off\n" +
              "• Remove days from plan\n" +
              "• Copy/rename/swap days\n" +
              "• Delete entire plan\n\n" +
              "Please specify which single operation you'd like me to perform.",
          ),
        ],
        responseHandled: true,
      };
    }

    // Now check if extractedEdit exists for valid edit types
    if (!analysis.extractedEdit) {
      // console.log("  ❌ No extractedEdit found");
      return {
        mode: "query",
        messages: [
          new AIMessage(
            "I couldn't extract the edit details. Please try again.",
          ),
        ],
        responseHandled: true,
      };
    }

    // Route to appropriate validation based on edit type
    const validationResult = await validateEditRequest(state, analysis);

    if (validationResult.needsClarification) {
      return validationResult.response;
    }

    if (!validationResult.isValid) {
      return validationResult.response;
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
      awaitingClarification: null, // Clear any clarification state
    };
  }

  // PRIORITY 4: Handle queries - pass answer to respond node
  // console.log("  💬 QUERY - passing to respond node");
  return {
    mode: "query",
    cachedAnswer: answer,
    awaitingClarification: null, // Clear any clarification state
  };
}

/**
 * Route edit request to appropriate validation function
 */
async function validateEditRequest(
  state: PlanChatbotStateType,
  analysis: EditAnalysisResult,
): Promise<{
  isValid: boolean;
  needsClarification: boolean;
  response: Partial<PlanChatbotStateType>;
}> {
  switch (analysis.editType) {
    case "add_task":
      return await validateAddTask(state, analysis);

    case "remove_task":
      return await validateRemoveTask(state, analysis);

    case "modify_task":
      return await validateModifyTask(state, analysis);

    case "delete_plan":
      return await validateDeletePlan(state, analysis);

    case "add_days_off":
    case "remove_days":
    case "copy_day":
    case "rename_day":
    case "swap_days":
      return await validateDayOperation(state, analysis);

    default:
      return {
        isValid: false,
        needsClarification: false,
        response: {
          mode: "query",
          messages: [new AIMessage("Unsupported operation type.")],
          responseHandled: true,
        },
      };
  }
}

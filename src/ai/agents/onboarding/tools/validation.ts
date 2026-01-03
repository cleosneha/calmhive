import { validateTimeResponse, isTimeQuestion } from "../utils/time-validator";
import { performLLMValidation } from "../utils/llm-validator";
import { HARD_CODED_MESSAGES } from "../utils/hardcoded-messages";

/**
 * Unified validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  isRelevant: boolean;
  hasSafetyIssue: boolean;
  wantsToModify?: boolean;
  userWantsToSkip?: boolean; // User wants to skip (checked against required status)
  modificationRequired?: boolean; // User wants to modify a previous response
  modifiedField?: string; // Which field to modify
  modifiedValue?: string; // New value for the field
  mappedResponse?: string; // For age mapping or other auto-corrections
  safetyMessage?: string;
  followUpText?: string;
  errorMessage?: string;
  goalSpecificQuestion?: string; // Contextual follow-up question
  goalOptions?: string[]; // Answer options for goal-specific question
  // New: readiness detection carried from LLM for the greeting question
  readiness?: "yes" | "no";
}

/**
 * Unified validation tool: Performs all checks in optimal order
 * 1. Rule-based safety (instant, no LLM)
 * 2. Spam/gibberish detection (regex, no LLM)
 * 3. LLM unified check (relevance + advanced safety + follow-up)
 */
export async function validateUserResponse(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string
): Promise<ValidationResult> {
  const trimmedResponse = userResponse.trim();

  // ===== STEP 6: Time validation =====
  if (isTimeQuestion(currentQuestionText)) {
    const timeValidation = validateTimeResponse(trimmedResponse);
    if (!timeValidation.isValid) {
      return {
        isValid: false,
        isRelevant: false,
        hasSafetyIssue: false,
        errorMessage: timeValidation.errorMessage,
      };
    }
  }

  // ===== STEP 7: LLM unified validation (intelligently detects expectation mismatches for goals, activities, and any positive/negative expectations) =====
  try {
    const llmResult = await performLLMValidation(
      trimmedResponse,
      currentQuestionText,
      nextQuestionText
    );

    // PRIORITY 0: Check modification FIRST - user wants to update a previous answer
    if (
      llmResult.modificationRequired &&
      llmResult.modifiedField &&
      llmResult.modifiedValue
    ) {
      return {
        isValid: true,
        isRelevant: true,
        hasSafetyIssue: false,
        modificationRequired: true,
        modifiedField: llmResult.modifiedField,
        modifiedValue: llmResult.modifiedValue,
        followUpText: HARD_CODED_MESSAGES.MODIFICATION_ACK,
      };
    }

    // PRIORITY 1: Check safety FIRST - safety is the highest priority
    if (llmResult.hasSafetyIssue) {
      // Use LLM-generated safety message if available (from MISMATCH_MESSAGE field when safety issue detected)
      const safetyMsg = llmResult.mismatchMessage;

      return {
        isValid: false,
        isRelevant: true,
        hasSafetyIssue: true,
        safetyMessage: safetyMsg,
      };
    }

    // PRIORITY 3: Check relevance
    if (!llmResult.isRelevant) {
      return {
        isValid: false,
        isRelevant: false,
        hasSafetyIssue: false,
        errorMessage:
          "That answer seems to be irrelevant to the question asked. Could you please provide a relevant response to the previously asked question?",
      };
    }

    // PRIORITY 4: Check expectation mismatch
    if (llmResult.hasExpectationMismatch) {
      const errorMessage =
        llmResult.mismatchMessage && llmResult.mismatchMessage !== "none"
          ? llmResult.mismatchMessage
          : "That answer seems a bit weird or not what we're expecting. Could you share something more else that fits the question better?";

      // If this is a readiness question and user said no, return readiness info
      if (llmResult.readiness === "no") {
        return {
          isValid: false,
          isRelevant: true,
          hasSafetyIssue: false,
          readiness: "no",
          followUpText: errorMessage,
        };
      }

      return {
        isValid: false,
        isRelevant: true,
        hasSafetyIssue: false,
        errorMessage,
      };
    }

    // Build final follow-up text
    let finalFollowUp =
      llmResult.followUpText || `Thank you for sharing. ${nextQuestionText}`;
    if (llmResult.suggestBestTime && llmResult.suggestBestTime !== "none") {
      finalFollowUp += `\n\nWellness tip: Many people find the ${llmResult.suggestBestTime} is a good time to try new routines. Let's explore that!`;
    }

    // Ensure we always have valid follow-up text
    if (!finalFollowUp || finalFollowUp.trim() === "") {
      finalFollowUp = `Thank you for sharing. ${nextQuestionText}`;
    }

    // Return with goal suggestions if applicable
    const result: ValidationResult = {
      isValid: true,
      isRelevant: true,
      hasSafetyIssue: false,
      userWantsToSkip: llmResult.userWantsToSkip,
      followUpText: finalFollowUp,
      readiness: llmResult.readiness,
    };

    // Add goal question and options if this is a goal question
    if (llmResult.goalSpecificQuestion) {
      result.goalSpecificQuestion = llmResult.goalSpecificQuestion;
    }

    if (llmResult.goalOptions && llmResult.goalOptions.length > 0) {
      result.goalOptions = llmResult.goalOptions;
    }

    return result;
  } catch (error) {
    console.error("Error in LLM validation:", error);
    return {
      isValid: true,
      isRelevant: true,
      hasSafetyIssue: false,
      followUpText: `Thank you for sharing. ${nextQuestionText}`,
    };
  }
}

import { geminiModel, mistralModel } from "@/ai/config/llm";
import { buildLLMPrompt, PromptType } from "./prompt-builder";
import { LLMValidationResult } from "@/ai/agents/onboarding/types";
import { handleAIError } from "@/utils/ai-error-handler";

/**
 * Centralized LLM invocation with Mistral fallback for 429 errors
 */
export async function invokeLLM(prompt: string): Promise<string> {
  try {
    console.log("🤖 Trying Gemini model...");
    const response = await geminiModel.invoke(prompt);
    return response.content.toString();
  } catch (geminiError) {
    console.warn("⚠️ Gemini failed, trying Mistral...", geminiError);
    try {
      console.log("🤖 Trying Mistral model...");
      const fallbackResponse = await mistralModel.invoke(prompt);
      console.log("✅ Used Mistral model for fallback");
      return fallbackResponse.content.toString();
    } catch (mistralError) {
      console.error("❌ Both models failed:", { geminiError, mistralError });
      throw new Error(
        `Both AI models failed. Gemini: ${geminiError instanceof Error ? geminiError.message : "Unknown error"}. Mistral: ${mistralError instanceof Error ? mistralError.message : "Unknown error"}`,
      );
    }
  }
}

/**
 * Perform LLM-based validation with intelligent context awareness
 */
export async function performLLMValidation(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string,
  promptType?: PromptType, // Optional override for special cases like DOB
): Promise<LLMValidationResult> {
  try {
    // Determine prompt type
    let type: PromptType = promptType || "default";

    // Auto-detect if not provided
    if (!promptType) {
      const lower = currentQuestionText.toLowerCase();
      const isMainGoalsQuestion = lower.includes("main goals");
      const isGoalSpecificInfoQuestion = lower.includes(
        "tell me more about this goal",
      );

      if (isMainGoalsQuestion) type = "main_goals";
      else if (isGoalSpecificInfoQuestion) type = "goal_specific_info";
    }

    const lower = currentQuestionText.toLowerCase();
    const isGoalQuestion =
      lower.includes("main goals") ||
      lower.includes("aspect of stress") ||
      lower.includes("area would you like") ||
      lower.includes("biggest challenge");

    const prompt = buildLLMPrompt(
      type,
      userResponse,
      currentQuestionText,
      nextQuestionText,
    );

    const content = await invokeLLM(prompt);

    const relevanceMatch = content.match(/^RELEVANCE:\s*(yes|no)/im);
    const safetyMatch = content.match(/^SAFETY:\s*(safe|concern)/im);
    const expectationMismatchMatch = content.match(
      /^EXPECTATION_MISMATCH:\s*(yes|no)/im,
    );

    const mismatchMessageMatch = content.match(
      /^MISMATCH_MESSAGE:\s*["']?(.+?)["']?\s*(?=\n[A-Z_]+:|$)/im,
    );
    const suggestBestTimeMatch = content.match(/^SUGGEST_BEST_TIME:\s*(.+)/im);
    const goalOptionsMatch = content.match(
      /^GOAL_OPTIONS:\s*(.+?)(?=\n[A-Z_]+:|$)/im,
    );
    const goalSpecificQuestionMatch = content.match(
      /^GOAL_SPECIFIC_QUESTION:\s*(.+?)(?=\n[A-Z_]+:|$)/im,
    );
    const followUpMatch = content.match(/^FOLLOW_UP:\s*(.+)/im);
    const skipMatch = content.match(/^USER_WANTS_TO_SKIP:\s*(yes|no)/im);
    const readinessMatch = content.match(/^READINESS:\s*(yes|no)/im);
    const modificationRequiredMatch = content.match(
      /^MODIFICATION_REQUIRED:\s*(yes|no)/im,
    );
    const modifiedFieldMatch = content.match(
      /^MODIFIED_FIELD:\s*(.+?)(?=\n[A-Z_]+:|$)/im,
    );
    const modifiedValueMatch = content.match(
      /^MODIFIED_VALUE:\s*(.+?)(?=\n[A-Z_]+:|$)/im,
    );

    // Parse DOB-specific fields (for date_of_birth prompt)
    const statusMatch = content.match(
      /STATUS:\s*(VALID|AMBIGUOUS|NEEDS_FULL_YEAR|INVALID)/i,
    );
    const dayMatch = content.match(/DAY:\s*(\d+|none)/i);
    const monthMatch = content.match(/MONTH:\s*(\d+|none)/i);
    const yearMatch = content.match(/YEAR:\s*(\d+|none)/i);
    const dobErrorMatch = content.match(/ERROR:\s*(.+?)(?=\n|$)/i);

    // Parse format clarification fields (for date_format_clarification prompt)
    const clarMatch = content.match(/CLARIFICATION:\s*(yes|no)/i);
    const formatMatch = content.match(
      /FORMAT:\s*(DD\/MM\/YYYY|MM\/DD\/YYYY|none)/i,
    );

    // Parse goal options
    let goalOptions: string[] | undefined;
    if (goalOptionsMatch) {
      goalOptions = goalOptionsMatch[1]
        .split(",")
        .map((s) => s.trim())
        .map((s) => s.replace(/^["']|["']$/g, "")) // Strip surrounding quotes
        .filter((s) => s.length > 0)
        .slice(0, 3);
    }

    // Normalize readiness
    let readiness: "yes" | "no" | undefined;
    if (readinessMatch) {
      const r = readinessMatch[1].toLowerCase();
      readiness = r === "yes" ? "yes" : "no";
    }

    return {
      isRelevant: relevanceMatch?.[1]?.toLowerCase() === "yes",
      hasSafetyIssue: safetyMatch?.[1]?.toLowerCase() === "concern",
      hasExpectationMismatch:
        expectationMismatchMatch?.[1]?.toLowerCase() === "yes",
      userWantsToSkip: skipMatch?.[1]?.toLowerCase() === "yes",
      modificationRequired:
        modificationRequiredMatch?.[1]?.toLowerCase() === "yes",
      modifiedField:
        modifiedFieldMatch?.[1]?.trim() !== "none"
          ? modifiedFieldMatch?.[1]?.trim()
          : undefined,
      modifiedValue:
        modifiedValueMatch?.[1]?.trim() !== "none"
          ? modifiedValueMatch?.[1]?.trim()
          : undefined,
      mismatchMessage: mismatchMessageMatch
        ? mismatchMessageMatch[1]
            .trim()
            .replace(/^["']|["']$/g, "") // Remove surrounding quotes
            .trim()
        : undefined,
      suggestBestTime: suggestBestTimeMatch?.[1]?.trim(),
      followUpText: followUpMatch?.[1]?.trim(),
      isGoalQuestion,
      goalOptions,
      goalSpecificQuestion: goalSpecificQuestionMatch?.[1]?.trim(),
      readiness,
      // DOB-specific fields
      dobStatus: statusMatch?.[1]
        ? (statusMatch[1].toUpperCase() as
            | "VALID"
            | "AMBIGUOUS"
            | "NEEDS_FULL_YEAR"
            | "INVALID")
        : undefined,
      day:
        dayMatch?.[1] !== "none"
          ? parseInt(dayMatch?.[1] || "0", 10)
          : undefined,
      month:
        monthMatch?.[1] !== "none"
          ? parseInt(monthMatch?.[1] || "0", 10)
          : undefined,
      year:
        yearMatch?.[1] !== "none"
          ? parseInt(yearMatch?.[1] || "0", 10)
          : undefined,
      dobError:
        dobErrorMatch?.[1]?.trim() !== "none"
          ? dobErrorMatch?.[1]?.trim()
          : undefined,
      // Format clarification fields
      clarification: clarMatch?.[1]?.toLowerCase() === "yes",
      dateFormat:
        formatMatch?.[1] !== "none"
          ? (formatMatch?.[1] as "DD/MM/YYYY" | "MM/DD/YYYY")
          : undefined,
    };
  } catch (error) {
    console.error("❌ Error in LLM validation:", error);
    const { error: errorMessage } = handleAIError(error);
    throw new Error(errorMessage);
  }
}

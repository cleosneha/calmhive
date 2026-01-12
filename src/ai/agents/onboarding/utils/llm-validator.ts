import llm from "@/ai/config/llm";
import { buildLLMPrompt, PromptType } from "./prompt-builder";
import { LLMValidationResult } from "@/ai/agents/onboarding/types";
import { handleAIError } from "@/utils/ai-error-handler";

/**
 * Perform LLM-based validation with intelligent context awareness
 */
export async function performLLMValidation(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string
): Promise<LLMValidationResult> {
  try {
    // Determine prompt type
    const lower = currentQuestionText.toLowerCase();
    const isGoalQuestion =
      lower.includes("main goals") ||
      lower.includes("aspect of stress") ||
      lower.includes("area would you like") ||
      lower.includes("biggest challenge");

    const isMainGoalsQuestion = lower.includes("main goals");
    const isGoalSpecificInfoQuestion = lower.includes(
      "tell me more about this goal"
    );

    let type: PromptType = "default";
    if (isMainGoalsQuestion) type = "main_goals";
    else if (isGoalSpecificInfoQuestion) type = "goal_specific_info";

    const prompt = buildLLMPrompt(
      type,
      userResponse,
      currentQuestionText,
      nextQuestionText
    );

    const response = await llm.invoke(prompt);
    const content =
      typeof response.content === "string" ? response.content.trim() : "";

    const relevanceMatch = content.match(/^RELEVANCE:\s*(yes|no)/im);
    const safetyMatch = content.match(/^SAFETY:\s*(safe|concern)/im);
    const expectationMismatchMatch = content.match(
      /^EXPECTATION_MISMATCH:\s*(yes|no)/im
    );

    const mismatchMessageMatch = content.match(
      /^MISMATCH_MESSAGE:\s*["']?(.+?)["']?\s*(?=\n[A-Z_]+:|$)/im
    );
    const suggestBestTimeMatch = content.match(/^SUGGEST_BEST_TIME:\s*(.+)/im);
    const goalOptionsMatch = content.match(
      /^GOAL_OPTIONS:\s*(.+?)(?=\n[A-Z_]+:|$)/im
    );
    const goalSpecificQuestionMatch = content.match(
      /^GOAL_SPECIFIC_QUESTION:\s*(.+?)(?=\n[A-Z_]+:|$)/im
    );
    const followUpMatch = content.match(/^FOLLOW_UP:\s*(.+)/im);
    const skipMatch = content.match(/^USER_WANTS_TO_SKIP:\s*(yes|no)/im);
    const readinessMatch = content.match(/^READINESS:\s*(yes|no)/im);
    const modificationRequiredMatch = content.match(
      /^MODIFICATION_REQUIRED:\s*(yes|no)/im
    );
    const modifiedFieldMatch = content.match(
      /^MODIFIED_FIELD:\s*(.+?)(?=\n[A-Z_]+:|$)/im
    );
    const modifiedValueMatch = content.match(
      /^MODIFIED_VALUE:\s*(.+?)(?=\n[A-Z_]+:|$)/im
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
    };
  } catch (error) {
    console.error("❌ Error in LLM validation:", error);
    const { error: errorMessage } = handleAIError(error);
    throw new Error(errorMessage);
  }
}

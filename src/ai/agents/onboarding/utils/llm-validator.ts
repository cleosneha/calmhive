import llm from "@/ai/config/llm";
import { buildLLMPrompt, PromptType } from "./prompt-builder";
import { LLMValidationResult } from "@/ai/agents/onboarding/types";

/**
 * Perform LLM-based validation with intelligent context awareness
 */
export async function performLLMValidation(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string
): Promise<LLMValidationResult> {
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

  // Debug logging for LLM response
  console.log("\n🔍 [LLM Response Debug]");
  console.log("Question:", currentQuestionText.substring(0, 60) + "...");
  console.log("User input:", userResponse);
  console.log("Raw LLM response:", content);

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

  // Helper normalize for textual fields (treat 'none' and 'n/a' as absent)
  function normalizeField(raw?: string): string | undefined {
    if (!raw) return undefined;
    const v = raw
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .trim();
    if (!v) return undefined;
    const lower = v.toLowerCase();
    if (
      lower === "none" ||
      lower === "n/a" ||
      lower === "na" ||
      lower === "no" ||
      lower === "false" ||
      lower === "null" ||
      lower === "undefined"
    )
      return undefined;
    return v;
  }

  // Parse goal options (normalize and remove 'none')
  let goalOptions: string[] | undefined;
  if (goalOptionsMatch) {
    goalOptions = goalOptionsMatch[1]
      .split(",")
      .map((s) => normalizeField(s))
      .filter((s): s is string => Boolean(s))
      .slice(0, 3);
  }

  // Normalize readiness
  let readiness: "yes" | "no" | undefined;
  if (readinessMatch) {
    const r = readinessMatch[1].toLowerCase();
    readiness = r === "yes" ? "yes" : "no";
  }

  const result = {
    isRelevant: relevanceMatch?.[1]?.toLowerCase() === "yes",
    hasSafetyIssue: safetyMatch?.[1]?.toLowerCase() === "concern",
    hasExpectationMismatch:
      expectationMismatchMatch?.[1]?.toLowerCase() === "yes",
    userWantsToSkip: skipMatch?.[1]?.toLowerCase() === "yes",
    modificationRequired:
      modificationRequiredMatch?.[1]?.toLowerCase() === "yes",
    modifiedField: normalizeField(modifiedFieldMatch?.[1]),
    modifiedValue: normalizeField(modifiedValueMatch?.[1]),
    mismatchMessage: normalizeField(mismatchMessageMatch?.[1]),
    suggestBestTime: normalizeField(suggestBestTimeMatch?.[1]),
    followUpText: normalizeField(followUpMatch?.[1]),
    isGoalQuestion,
    goalOptions,
    goalSpecificQuestion: normalizeField(goalSpecificQuestionMatch?.[1]),
    readiness,
  };

  console.log("\n📊 [Parsed LLM Result]");
  console.log(JSON.stringify(result, null, 2));
  console.log("---\n");

  return result;
}

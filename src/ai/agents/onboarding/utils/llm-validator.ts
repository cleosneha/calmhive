import llm from "@/ai/config/llm";

/**
 * LLM validation response interface
 */
export interface LLMValidationResult {
  isRelevant: boolean;
  hasSafetyIssue: boolean;
  hasExpectationMismatch: boolean;
  userWantsToSkip: boolean; // User explicitly wants to skip this question
  mismatchMessage?: string;
  suggestBestTime?: string;
  followUpText?: string;
  isGoalQuestion?: boolean;
  goalSpecificQuestion?: string; // Contextual follow-up question for goal
  goalOptions?: string[]; // Answer options for the goal-specific question
  readiness?: "yes" | "no";
}

/**
 * Perform LLM-based validation with intelligent context awareness
 */
export async function performLLMValidation(
  userResponse: string,
  currentQuestionText: string,
  nextQuestionText: string
): Promise<LLMValidationResult> {
  // Check if this is a goal-related question (main goals or goal-specific follow-up)
  const isGoalQuestion =
    currentQuestionText.toLowerCase().includes("main goals") ||
    currentQuestionText.toLowerCase().includes("aspect of stress") ||
    currentQuestionText.toLowerCase().includes("area would you like") ||
    currentQuestionText.toLowerCase().includes("biggest challenge");

  // For main goals question, generate contextual follow-up question and suggestions
  const isMainGoalsQuestion = currentQuestionText
    .toLowerCase()
    .includes("main goals");

  const prompt = isMainGoalsQuestion
    ? `You are CalmHive's onboarding assistant. The user just shared their main goal. Generate a specific follow-up question and 3 relevant answer options based on their goal.

User's Goal: "${userResponse}"

Reply in this format:
MODIFICATION: [yes/no]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [custom error message or "none"]
USER_WANTS_TO_SKIP: [yes/no]
GOAL_SPECIFIC_QUESTION: [Generate a specific question about their goal, e.g., for "reduce overthinking" ask "What situations trigger your overthinking?"]
GOAL_OPTIONS: [3 comma-separated concrete answer options for the question, e.g., "Sitting idle", "Meeting toxic people", "Drinking Alcohol"]
FOLLOW_UP: [Brief warm acknowledgment of their goal]

Guidelines:
- GOAL_SPECIFIC_QUESTION: Must be a specific, actionable question related to their stated goal. Not generic.
- GOAL_OPTIONS: Each option should be a specific, concrete scenario or situation related to their goal that they can select as an answer.
- USER_WANTS_TO_SKIP: yes if user explicitly wants to skip this question or pass. Otherwise no.
- FOLLOW_UP: Just acknowledge, don't repeat the question.`
    : `You are CalmHive's onboarding assistant. Analyze the user's response for the current onboarding question and reply in this format:

MODIFICATION: [yes/no]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [custom error message or "none"]
USER_WANTS_TO_SKIP: [yes/no]
SUGGEST_BEST_TIME: [suggestion or "none"]
FOLLOW_UP: [acknowledgment]
READINESS: [yes/no]

Current Question: "${currentQuestionText}"
User Response: "${userResponse}"
Next Question: "${nextQuestionText}"

Guidelines:
- RELEVANCE: yes if user answers the question, no if off-topic/spam/gibberish.
- SAFETY: concern only for crisis/extreme cases. Otherwise safe.
- EXPECTATION_MISMATCH: yes if the response is negative, dismissive, or non-constructive. Otherwise no.
- USER_WANTS_TO_SKIP: yes if user explicitly expresses intent to skip this question (e.g., "I want to skip", "can I pass"). Otherwise no.
- SUGGEST_BEST_TIME: If question is about energy and user says "never", suggest morning/afternoon/evening. Otherwise "none".
- FOLLOW_UP: Only if RELEVANCE=yes, SAFETY=safe, EXPECTATION_MISMATCH=no, MODIFICATION=no, USER_WANTS_TO_SKIP=no. Brief warm acknowledgment.`;

  const response = await llm.invoke(prompt);
  const content =
    typeof response.content === "string" ? response.content.trim() : "";
  console.log("LLM Validator Response:", content);
  console.log("=".repeat(50));

  const relevanceMatch = content.match(/^RELEVANCE:\s*(yes|no)/im);
  const safetyMatch = content.match(/^SAFETY:\s*(safe|concern)/im);
  const expectationMismatchMatch = content.match(
    /^EXPECTATION_MISMATCH:\s*(yes|no)/im
  );

  console.log("Parsed Safety Match:", {
    safetyMatch: safetyMatch?.[0],
    safetyValue: safetyMatch?.[1],
    hasSafetyIssue: safetyMatch?.[1]?.toLowerCase() === "concern",
  });
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

  // Parse goal options
  let goalOptions: string[] | undefined;
  if (goalOptionsMatch) {
    goalOptions = goalOptionsMatch[1]
      .split(",")
      .map((s) => s.trim())
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
}

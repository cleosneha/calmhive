export type PromptType = "main_goals" | "goal_specific_info" | "default";

export function buildLLMPrompt(
  type: PromptType,
  userResponse: string,
  currentQuestion: string,
  nextQuestion: string
) {
  switch (type) {
    case "main_goals":
      return `You are CalmHive's onboarding assistant. The user just shared their main goal. Generate a specific follow-up question and 3 relevant answer options based on their goal.

User's Goal: "${userResponse}"

Reply in this format:
MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [field name or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [custom error message or "none"]
USER_WANTS_TO_SKIP: [yes/no]
GOAL_SPECIFIC_QUESTION: [Generate a specific question about their goal, e.g., for "reduce overthinking" ask "What situations trigger your overthinking?"]
GOAL_OPTIONS: [3 comma-separated concrete answer options for the question, e.g., "Sitting idle", "Meeting toxic people", "Drinking Alcohol"]
FOLLOW_UP: [Brief warm acknowledgment of their goal]

Guidelines:
- MODIFICATION_REQUIRED: yes if user is trying to correct/change a previous answer (e.g., "my age is actually 40", "I meant to say...", "sorry, I meant reduce stress", "correction: my goal is...", "apologies, actually it's...", etc). Otherwise no.
- MODIFIED_FIELD: If MODIFICATION_REQUIRED=yes, identify which field (age, goals, activities, timeAvailability, energeticTime). Otherwise "none".
- MODIFIED_VALUE: If MODIFICATION_REQUIRED=yes, extract the new value. Otherwise "none".
- GOAL_SPECIFIC_QUESTION: Must be a specific, actionable question related to their stated goal. Not generic.
- GOAL_OPTIONS: Each option should be a specific, concrete scenario or situation related to their goal that they can select as an answer.
- USER_WANTS_TO_SKIP: yes if user explicitly wants to skip this question or pass. Otherwise no.
- FOLLOW_UP: Just acknowledge, don't repeat the question.`;

    case "goal_specific_info":
      return `You are CalmHive's onboarding assistant. The user is answering a goal-specific follow-up question. Analyze their response carefully.

Current Question (Goal-Specific Info): "${currentQuestion}"
User Response: "${userResponse}"

Reply in this format:
MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [field name or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [custom error message or "none"]
USER_WANTS_TO_SKIP: [yes/no]
SUGGEST_BEST_TIME: [suggestion or "none"]
FOLLOW_UP: [acknowledgment]
READINESS: [yes/no]

Guidelines:
- MODIFICATION_REQUIRED: yes if user is trying to change their original goal or correct their previous response (e.g., "actually, I want to change my goal to reduce stress instead", "sorry I meant something different", "apologies, my goal is to reduce overthinking", "I want to correct my goal", etc). Otherwise no.
- MODIFIED_FIELD: If user wants to change their original goal, set to "goals". Otherwise "none".
- MODIFIED_VALUE: If MODIFICATION_REQUIRED=yes and MODIFIED_FIELD="goals", extract what goal they want to switch to (the new goal). Otherwise "none".
- RELEVANCE: yes if user properly answers the goal-specific question, no if off-topic/spam.
- SAFETY: concern only for crisis/extreme cases. Otherwise safe.
- EXPECTATION_MISMATCH: yes if the response is negative or non-constructive about their goal. Otherwise no.
- USER_WANTS_TO_SKIP: yes if user explicitly wants to skip. Otherwise no.
- FOLLOW_UP: Brief warm acknowledgment of their answer.`;

    default:
      return `You are CalmHive's onboarding assistant. Analyze the user's response for the current onboarding question and reply in this format:

MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [field name or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [custom error message or "none"]
USER_WANTS_TO_SKIP: [yes/no]
SUGGEST_BEST_TIME: [suggestion or "none"]
FOLLOW_UP: [acknowledgment]
READINESS: [yes/no]

Current Question: "${currentQuestion}"
User Response: "${userResponse}"
Next Question: "${nextQuestion}"

Guidelines:
- MODIFICATION_REQUIRED: yes if user is trying to correct/change a previous answer (e.g., "my age is actually 40", "sorry, I meant reduce stress not anxiety", etc). Otherwise no.
- MODIFIED_FIELD: If MODIFICATION_REQUIRED=yes, identify which field they're modifying (age, goals, activities, timeAvailability, energeticTime,etc). Otherwise "none".
- MODIFIED_VALUE: If MODIFICATION_REQUIRED=yes, extract the new value they want to set. Otherwise "none".
- RELEVANCE: yes if user answers the question, no if off-topic/spam/gibberish.
- SAFETY: concern only for crisis/extreme cases. Otherwise safe.
- EXPECTATION_MISMATCH: yes if the response is negative, dismissive, or non-constructive. Otherwise no.
- USER_WANTS_TO_SKIP: yes if user explicitly expresses intent to skip this question (e.g., "I want to skip", "can I pass"). Otherwise no.
- SUGGEST_BEST_TIME: If question is about energy and user says "never", suggest morning/afternoon/evening. Otherwise "none".
- FOLLOW_UP: Only if RELEVANCE=yes, SAFETY=safe, EXPECTATION_MISMATCH=no, MODIFICATION_REQUIRED=no, USER_WANTS_TO_SKIP=no. Brief warm acknowledgment.`;
  }
}

export type PromptType =
  | "main_goals"
  | "goal_specific_info"
  | "date_of_birth"
  | "date_format_clarification"
  | "default";

export function buildLLMPrompt(
  type: PromptType,
  userResponse: string,
  currentQuestion: string,
  nextQuestion: string,
) {
  switch (type) {
    case "main_goals":
      return `Analyze if user is modifying a previous answer OR answering the goals question.

Question: "${currentQuestion}"
Response: "${userResponse}"

Output:
MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [readiness/dateOfBirth/activities/timeAvailability/energeticTime/daysOff/anythingElse or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no] - no if off-topic/spam AND not a modification
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [error msg or "none"]
USER_WANTS_TO_SKIP: [yes/no]
GOAL_SPECIFIC_QUESTION: [Only if RELEVANCE=yes and MODIFICATION_REQUIRED=no]
GOAL_OPTIONS: [3 options only if RELEVANCE=yes and MODIFICATION_REQUIRED=no]
FOLLOW_UP: [Brief warm acknowledgment of their goal, , might contain a small fact(only if RELEVANCE=yes and MODIFICATION_REQUIRED=no and EXPECTATION_MISMATCH=no)]

Rules:
- MODIFICATION_REQUIRED=yes if correcting/changing ANY previous field (e.g., "my date of birth is 15/03/1990", "I said morning not evening", "activities are reading", "no daysOff")
- MODIFIED_FIELD: identify field being modified OR "none"
- MODIFIED_VALUE: [new value or "none"]
- RELEVANCE=yes if user describes valid wellness goal for CalmHive and no only if off-topic AND not modifying a field
- SAFETY=concern only for crisis
- FOLLOW_UP: only if genuinely answering goals question
- GOAL_SPECIFIC_QUESTION: [Generate a specific question about their goal, e.g., for "reduce overthinking" ask "What situations trigger your overthinking?"]
- GOAL_OPTIONS: [3 comma-separated concrete answer options for the question, e.g., "Sitting idle", "Meeting toxic people", "Drinking Alcohol"]
- USER_WANTS_TO_SKIP: yes if user explicitly wants to skip this question or pass. Otherwise no.
- EXPECTATION_MISMATCH: yes if the response is negative or non-constructive about their goal. Otherwise no.`;

    case "goal_specific_info":
      return `Analyze if user is modifying any previous field OR answering the goal-specific follow-up.

Question: "${currentQuestion}"
Response: "${userResponse}"

Output:
MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [goals/readiness/dateOfBirth/activities/timeAvailability/energeticTime/daysOff or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [error msg or "none"]
USER_WANTS_TO_SKIP: [yes/no]
FOLLOW_UP: [Brief warm acknowledgment, might have small fact(only if RELEVANCE=yes and MODIFICATION_REQUIRED=no and EXPECTATION_MISMATCH=no)]
GOAL_SPECIFIC_QUESTION: [Only if MODIFIED_FIELD=goals: generate a specific follow-up question about the new goal]
GOAL_OPTIONS: [Only if MODIFIED_FIELD=goals: 3 concrete options]

Rules:
- This question requests MORE DETAILS about the user's existing goal, but the user MAY also request modifications to any previous field
- MODIFICATION_REQUIRED=yes if user explicitly asks to change any previous field (e.g., "change my main goal", "my date of birth is 15/03/1990", "I said evening not morning", "activities are hiking")
- MODIFIED_FIELD: identify which field (use "goals" if changing main goal) or "none"
- When MODIFIED_FIELD=goals: generate GOAL_SPECIFIC_QUESTION and GOAL_OPTIONS and treat as a new goal flow
- If user simply provides details (e.g., "exam pressure", "work stress"), treat as answering current question (MODIFICATION_REQUIRED=no)
- RELEVANCE=yes if answering the goal-specific question or modifying
- SAFETY=concern only for crisis
- FOLLOW_UP: acknowledge only if genuinely answering (not modifying)
- EXPECTATION_MISMATCH: yes if negative/dismissive`;

    case "date_of_birth":
      return `Parse date of birth: "${userResponse}"

Output (one per line, exact format):
STATUS: [VALID|AMBIGUOUS|NEEDS_FULL_YEAR|INVALID]
DAY: [1-31 or none]
MONTH: [1-12 or none]
YEAR: [full year or none]
ERROR: [message or none]
MODIFICATION_REQUIRED: [yes|no]
MODIFIED_FIELD: [field or none]
MODIFIED_VALUE: [value or none]

Rules:
- Numeric date ambiguous if BOTH first≤12 AND second≤12 (e.g., 08/07/2004 is ambiguous)
- Parse any format: text (21 October 2004), numeric (21/10/2004), natural (October 21)
- 2-digit year → NEEDS_FULL_YEAR
- Day 1-31, month 1-12, year 1900-${new Date().getFullYear()}
- Check day valid for month (Feb=28/29)
- Detect modifications like "my goal is X"`;

    case "date_format_clarification":
      return `Date "${currentQuestion}" is ambiguous. User said: "${userResponse}"

Output (one per line, exact format):
CLARIFICATION: [yes|no]
FORMAT: [DD/MM/YYYY|MM/DD/YYYY|none]
MODIFICATION_REQUIRED: [yes|no]
MODIFIED_FIELD: [field or none]
MODIFIED_VALUE: [value or none]

Rules:
- CLARIFICATION=yes if specifying format (dd/mm, day/month, first one, etc)
- "first one"=DD/MM/YYYY, "second one"=MM/DD/YYYY
- Otherwise CLARIFICATION=no
- Detect other field modifications`;

    default:
      return `Analyze if user is modifying a previous answer OR answering the current question.

Question: "${currentQuestion}"
Response: "${userResponse}"
Next: "${nextQuestion}"

Output:
MODIFICATION_REQUIRED: [yes/no]
MODIFIED_FIELD: [readiness/dateOfBirth/goals/stressAspect/habitArea/sleepChallenge/goalSpecificInfo/timeAvailability/activities/energeticTime/daysOff/anythingElse or "none"]
MODIFIED_VALUE: [new value or "none"]
RELEVANCE: [yes/no]
SAFETY: [safe/concern]
EXPECTATION_MISMATCH: [yes/no]
MISMATCH_MESSAGE: [error msg or "none"]
USER_WANTS_TO_SKIP: [yes/no]
FOLLOW_UP: [Brief warm acknowledgment, might contain a small fact, of their answer(only if RELEVANCE=yes and MODIFICATION_REQUIRED=no and EXPECTATION_MISMATCH=no)]
READINESS: [yes/no] - only for readiness question
SUGGEST_BEST_TIME: [morning/afternoon/evening or "none"] - only for energeticTime question
GOAL_SPECIFIC_QUESTION: [Only if MODIFIED_FIELD=goals: generate question about new goal]
GOAL_OPTIONS: [Only if MODIFIED_FIELD=goals: 3 options]

Rules:
- MODIFICATION_REQUIRED=yes if user corrects/changes ANY previous field
- MODIFIED_FIELD: identify field OR "none". If user says "my main goal", "my goal", or "what I want to achieve", set to "goals" NOT current question field
- MODIFIED_VALUE: [new value or "none"]
- When MODIFIED_FIELD=goals: generate GOAL_SPECIFIC_QUESTION and GOAL_OPTIONS for new goal
- RELEVANCE=yes if answers question, no if off-topic AND not modifying
- SAFETY=concern only for crisis
- EXPECTATION_MISMATCH=yes if negative/dismissive
- FOLLOW_UP: warm acknowledgment only when truly answering
- SUGGEST_BEST_TIME: only if energeticTime question and user says "never" or uncertain`;
  }
}
